import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Typography,
    Paper,
    styled,
} from '@mui/material';
import { User } from '../types';
import { userApi } from '../services/api';

interface TreeNode extends User {
    rightLeg?: TreeNode;
    leftLeg?: TreeNode;
}

// Add a new interface for expanded nodes tracking
interface ExpandedNodes {
    [key: number]: boolean;
}

const TreeContainer = styled('ul')({
    listStyle: 'none',
    margin: '0 0 1em',
    padding: 0,
    position: 'relative',
    textAlign: 'center',
    display: 'table',
    width: '100%',
});

const TreeBranch = styled('ul')({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    position: 'relative',
    display: 'table',
    width: '100%',
    '&::before': {
        outline: 'solid 1px #666',
        content: '""',
        height: '0.5em',
        left: '50%',
        position: 'absolute',
        top: '-0.5em',
    },
});

const TreeItem = styled('li')({
    display: 'table-cell',
    padding: '0.5em 0',
    verticalAlign: 'top',
    position: 'relative',
    '&::before': {
        outline: 'solid 1px #666',
        content: '""',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    '&:first-of-type::before': {
        left: '50%',
    },
    '&:last-child::before': {
        right: '50%',
    },
});

const NodeBox = styled(Paper)(({ theme }) => ({
    border: 'solid 1px #666',
    borderRadius: '0.2em',
    display: 'inline-block',
    margin: '0 0.2em 0.5em',
    padding: '0.2em 0.5em',
    position: 'relative',
    minWidth: 150,
    backgroundColor: theme.palette.background.paper,
    '&::before': {
        outline: 'solid 1px #666',
        content: '""',
        height: '0.5em',
        left: '50%',
        position: 'absolute',
        top: '-0.55em',
    },
    cursor: 'pointer',
    '&.empty': {
        backgroundColor: theme.palette.grey[100],
        border: `1px dashed ${theme.palette.grey[400]}`,
        cursor: 'not-allowed',
    },
    '&:hover:not(.empty)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const Tree: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            buildTree(selectedUserId);
        }
    }, [selectedUserId]);

    const loadUsers = async () => {
        try {
            const response = await userApi.getAll();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const buildTree = async (userId: string) => {
        try {
            const response = await userApi.getDownline(Number(userId));
            const downlineUsers = response.data.data || [];
            
            // Find the selected user
            const rootUser = users.find(u => u.id === Number(userId));
            if (!rootUser) return;

            // Build tree structure
            const tree: TreeNode = {
                ...rootUser,
                rightLeg: downlineUsers.find(u => u.leg === 'Bonus'),
                leftLeg: downlineUsers.find(u => u.leg === 'Incentive')
            };

            // Recursively build the tree for each leg
            if (tree.rightLeg) {
                tree.rightLeg = await buildSubTree(tree.rightLeg);
            }
            if (tree.leftLeg) {
                tree.leftLeg = await buildSubTree(tree.leftLeg);
            }

            setTreeData(tree);
        } catch (error) {
            console.error('Failed to build tree:', error);
        }
    };

    const buildSubTree = async (node: TreeNode): Promise<TreeNode> => {
        const response = await userApi.getDownline(node.id!);
        const downlineUsers = response.data.data || [];

        return {
            ...node,
            rightLeg: await buildSubTreeForLeg(downlineUsers.find(u => u.leg === 'Bonus')),
            leftLeg: await buildSubTreeForLeg(downlineUsers.find(u => u.leg === 'Incentive'))
        };
    };

    const buildSubTreeForLeg = async (user: User | undefined): Promise<TreeNode | undefined> => {
        if (!user) return undefined;
        return buildSubTree(user as TreeNode);
    };

    const toggleNode = async (nodeId: number) => {
        if (!nodeId) return;

        setExpandedNodes(prev => {
            const newExpanded = { ...prev };
            if (newExpanded[nodeId]) {
                // Collapse this node and all its children
                const collapseChildren = (node: TreeNode) => {
                    if (!node) return;
                    delete newExpanded[node.id!];
                    if (node.rightLeg) collapseChildren(node.rightLeg);
                    if (node.leftLeg) collapseChildren(node.leftLeg);
                };

                const node = findNodeById(treeData!, nodeId);
                if (node) collapseChildren(node);
            } else {
                // Expand just this node
                newExpanded[nodeId] = true;
                // Load its children if needed
                loadNodeChildren(nodeId);
            }
            return newExpanded;
        });
    };

    const findNodeById = (tree: TreeNode, id: number): TreeNode | null => {
        if (tree.id === id) return tree;
        if (tree.rightLeg) {
            const found = findNodeById(tree.rightLeg, id);
            if (found) return found;
        }
        if (tree.leftLeg) {
            const found = findNodeById(tree.leftLeg, id);
            if (found) return found;
        }
        return null;
    };

    const loadNodeChildren = async (nodeId: number) => {
        try {
            const response = await userApi.getDownline(nodeId);
            const children = response.data.data || [];

            setTreeData(prevTree => {
                if (!prevTree) return null;
                
                const updateNode = (node: TreeNode): TreeNode => {
                    if (node.id === nodeId) {
                        return {
                            ...node,
                            rightLeg: children.find(c => c.leg === 'Bonus'),
                            leftLeg: children.find(c => c.leg === 'Incentive')
                        };
                    }
                    return {
                        ...node,
                        rightLeg: node.rightLeg ? updateNode(node.rightLeg) : undefined,
                        leftLeg: node.leftLeg ? updateNode(node.leftLeg) : undefined
                    };
                };

                return updateNode(prevTree);
            });
        } catch (error) {
            console.error('Failed to load children:', error);
        }
    };

    const renderNode = (node?: TreeNode) => (
        <NodeBox 
            elevation={1} 
            className={!node ? 'empty' : ''} 
            onClick={() => node && toggleNode(node.id!)}
        >
            {node ? (
                <>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {node.name}
                    </Typography>
                    {node.userid && (
                        <Typography variant="caption" display="block">
                            ID: {node.userid}
                        </Typography>
                    )}
                </>
            ) : (
                <Typography variant="caption" color="textSecondary">
                    Empty Position
                </Typography>
            )}
        </NodeBox>
    );

    const renderTree = (node: TreeNode) => (
        <TreeContainer>
            <TreeItem>
                {renderNode(node)}
                {expandedNodes[node.id!] && (
                    <TreeBranch>
                        <TreeItem>
                            {node.rightLeg ? renderTree(node.rightLeg) : renderNode()}
                        </TreeItem>
                        <TreeItem>
                            {node.leftLeg ? renderTree(node.leftLeg) : renderNode()}
                        </TreeItem>
                    </TreeBranch>
                )}
            </TreeItem>
        </TreeContainer>
    );

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <TextField
                    select
                    fullWidth
                    label="Select User"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                >
                    {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {treeData && (
                <Box sx={{ overflowX: 'auto', mt: 4 }}>
                    {renderTree(treeData)}
                </Box>
            )}
        </Paper>
    );
};

export default Tree; 
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
    '&.empty': {
        backgroundColor: theme.palette.grey[100],
        border: `1px dashed ${theme.palette.grey[400]}`,
    },
}));

const Tree: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [treeData, setTreeData] = useState<TreeNode | null>(null);

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

    const renderNode = (node?: TreeNode) => (
        <NodeBox elevation={1} className={!node ? 'empty' : ''}>
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
                <TreeBranch>
                    <TreeItem>
                        {node.rightLeg ? renderTree(node.rightLeg) : renderNode()}
                    </TreeItem>
                    <TreeItem>
                        {node.leftLeg ? renderTree(node.leftLeg) : renderNode()}
                    </TreeItem>
                </TreeBranch>
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
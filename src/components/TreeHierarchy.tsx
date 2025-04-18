import React from 'react';
import { User } from '../types';

interface TreeNodeProps {
    user: User;
    children?: React.ReactNode;
}

const TreeNode: React.FC<TreeNodeProps> = ({ user, children }) => {
    return (
        <div style={{ 
            marginLeft: '20px',
            padding: '10px',
            backgroundColor: user.is_green ? '#e8f5e9' : 'inherit'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{user.name}</span>
                <span style={{ marginLeft: '10px' }}>
                    (SP: {user.sp_value || '0'})
                </span>
                {/* ... existing node content ... */}
            </div>
            {children}
        </div>
    );
};

export default TreeNode; 
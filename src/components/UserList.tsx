import React from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { User } from '../types';

interface UserListProps {
    users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Leg</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Work</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>SP Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow 
                            key={user.id}
                            style={{
                                backgroundColor: user.is_green ? '#e8f5e9' : 'inherit'
                            }}
                        >
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.leg || 'None'}</TableCell>
                            <TableCell>{user.mobile_no || '-'}</TableCell>
                            <TableCell>{user.work || '-'}</TableCell>
                            <TableCell>{user.address || '-'}</TableCell>
                            <TableCell>{user.sp_value || '0'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserList; 
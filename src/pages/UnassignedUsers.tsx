import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
} from '@mui/material';
import { User } from '../types';
import { userApi } from '../services/api';
import TableHeader from '../components/TableHeader';
import TableToolbar from '../components/TableToolbar';
import TablePagination from '../components/TablePagination';
import { useTableFeatures } from '../hooks/useTableFeatures';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const UnassignedUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        items: filteredUsers,
        totalItems,
        page,
        setPage,
        pageSize,
        setPageSize,
        requestSort,
        sortConfig,
        searchTerm,
        setSearchTerm,
    } = useTableFeatures<User>(users, {
        defaultSort: {
            key: 'name',
            direction: 'asc'
        },
        defaultPageSize: 10
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getUnassigned();
            setUsers(response.data.data);
            setError(null);
        } catch (error) {
            setError('Failed to load unassigned users');
            console.error('Failed to load unassigned users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Unassigned Users</Typography>
            </Box>

            <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={[]}
                activeFilters={{}}
                onFilterChange={() => {}}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader
                                label="Name"
                                field="name"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                            />
                            <TableHeader
                                label="Mobile No"
                                field="mobile_no"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                            />
                            <TableHeader
                                label="Work"
                                field="work"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.mobile_no || '-'}</TableCell>
                                <TableCell>{user.work || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No unassigned users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                count={totalItems}
                page={page}
                rowsPerPage={pageSize}
                onPageChange={setPage}
                onRowsPerPageChange={setPageSize}
            />
        </>
    );
};

export default UnassignedUsers; 
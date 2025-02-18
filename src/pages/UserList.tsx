import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
} from '@mui/material';
import { Add as AddIcon, FileUpload as FileUploadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { User } from '../types';
import { userApi } from '../services/api';
import UserForm from '../components/UserForm';
import TableHeader from '../components/TableHeader';
import TableToolbar from '../components/TableToolbar';
import { useTableFeatures } from '../hooks/useTableFeatures';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ExportButton from '../components/ExportButton';
import { exportToExcel, importFromExcel, validateUserImport } from '../utils/importExport';
import TablePagination from '../components/TablePagination';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
        filters,
        setFilters,
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
            const response = await userApi.getAll();
            setUsers(response.data.data);
            setError(null);
        } catch (error) {
            setError('Failed to load users');
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (user: Partial<User>) => {
        try {
            await userApi.create(user);
            setOpenDialog(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    const handleRowClick = (userId: number) => {
        navigate(`/users/${userId}`);
    };

    const filterOptions = [
        {
            field: 'leg',
            label: 'Leg',
            options: [
                { value: 'Bonus', label: 'Bonus' },
                { value: 'Incentive', label: 'Incentive' },
                { value: 'null', label: 'None' },
            ],
        },
    ];

    const handleExport = () => {
        const exportData = users.map(user => ({
            name: user.name,
            leg: user.leg || '',
            mobile_no: user.mobile_no || '',
            address: user.address || '',
            work: user.work || '',
            remarks: user.remarks || '',
        }));
        exportToExcel(exportData, 'users_export');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const jsonData = await importFromExcel(file);
            const validatedData = jsonData.map(validateUserImport);

            // Create all users
            for (const user of validatedData) {
                await userApi.create(user);
            }

            loadUsers(); // Reload the users list
            setError(null);
        } catch (error) {
            console.error('Import failed:', error);
            setError('Failed to import users');
        }

        // Reset the file input
        event.target.value = '';
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Users</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<FileUploadIcon />}
                    >
                        Import
                        <input
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleImport}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add User
                    </Button>
                </Stack>
            </Box>

            <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={filters}
                onFilterChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
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
                                label="Leg"
                                field="leg"
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
                            <TableRow
                                key={user.id}
                                hover
                                onClick={() => user.id && handleRowClick(user.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.leg || 'None'}</TableCell>
                                <TableCell>{user.mobile_no || '-'}</TableCell>
                                <TableCell>{user.work || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No users found
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <UserForm
                        user={{}}
                        users={users}
                        onSubmit={handleAddUser}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserList; 
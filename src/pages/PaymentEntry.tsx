import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import { User } from '../types';
import { userApi, paymentApi } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

interface UserBalance {
    totalSales: number;
    totalPayments: number;
    balance: number;
}

const PaymentEntry: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | ''>('');
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userApi.getAll();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        }
    };

    const loadUserBalance = async (userId: number) => {
        try {
            const response = await paymentApi.getUserBalance(userId);
            setUserBalance(response.data);
        } catch (error) {
            console.error('Failed to load user balance:', error);
        }
    };

    const handleUserChange = (userId: number) => {
        setSelectedUser(userId);
        if (userId) {
            loadUserBalance(userId);
        } else {
            setUserBalance(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !amount || !date) return;

        try {
            await paymentApi.create({
                user_id: selectedUser,
                amount: parseFloat(amount),
                date,
            });

            // Reset form and show success message
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setSuccessMessage('Payment recorded successfully');
            
            // Reload user balance
            loadUserBalance(selectedUser);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Failed to create payment:', error);
        }
    };

    const userOptions = users.map(user => ({
        id: user.id!,
        label: user.name
    }));

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Payment Entry
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <SearchableSelect
                            label="Select User"
                            options={userOptions}
                            value={selectedUser || ''}
                            onChange={(value) => handleUserChange(Number(value))}
                        />
                    </Grid>

                    {userBalance && (
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    User Balance Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2">
                                            Total Sales: ₹{userBalance.totalSales.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2">
                                            Total Payments: ₹{userBalance.totalPayments.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color={userBalance.balance > 0 ? 'error' : 'success'}>
                                            Balance Amount: ₹{userBalance.balance.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!selectedUser || !amount || !date}
                            >
                                Record Payment
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default PaymentEntry; 
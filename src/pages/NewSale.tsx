import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Box,
} from '@mui/material';
import { User, Product, Sale } from '../types';
import { userApi, productApi, saleApi } from '../services/api';
import MultiProductSaleForm from '../components/MultiProductSaleForm';

const NewSale: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse, productsResponse] = await Promise.all([
                userApi.getAll(),
                productApi.getAll()
            ]);
            
            setUsers(usersResponse.data.data || []);
            setProducts(productsResponse.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load required data');
            setUsers([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (sales: Partial<Sale>[]) => {
        try {
            // Create all sales in sequence
            for (const sale of sales) {
                await saleApi.create(sale);
            }
            // Reset form
            setSelectedUserId('');
            // Show success message or redirect
        } catch (error) {
            console.error('Failed to create sales:', error);
            // Show error message
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                New Sale Entry
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        select
                        label="User"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            {selectedUserId && (
                <Box sx={{ mt: 3 }}>
                    <MultiProductSaleForm
                        products={products}
                        userId={selectedUserId}
                        onSubmit={handleSubmit}
                    />
                </Box>
            )}
        </Paper>
    );
};

export default NewSale; 
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { User, Product, Sale } from '../types';
import { userApi, productApi, saleApi } from '../services/api';

const NewSale: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState<Partial<Sale>>({
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
    });
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
            setProducts(productsResponse.data.data || []); // Access the data property
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saleApi.create(formData);
            // Reset form or show success message
            setFormData({
                date: new Date().toISOString().split('T')[0],
                quantity: 1,
            });
        } catch (error) {
            console.error('Failed to create sale:', error);
            // Show error message
        }
    };

    const handleProductChange = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                product_id: productId,
                mrp: product.mrp,
                dp: product.dp,
                sp: product.sp,
                sold_rate: product.sp, // Default to SP, can be changed by user
                final_amount: product.sp * (prev.quantity || 1)
            }));
        }
    };

    const updateFinalAmount = (quantity: number, rate: number) => {
        setFormData(prev => ({
            ...prev,
            final_amount: quantity * rate
        }));
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                New Sale Entry
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            select
                            label="User"
                            value={formData.user_id || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, user_id: Number(e.target.value) }))}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            select
                            fullWidth
                            label="Product"
                            value={formData.product_id || ''}
                            onChange={(e) => handleProductChange(Number(e.target.value))}
                        >
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.product_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="MRP"
                            type="number"
                            value={formData.mrp || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                            inputProps={{ step: "0.01" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="DP"
                            type="number"
                            value={formData.dp || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, dp: Number(e.target.value) }))}
                            inputProps={{ step: "0.01" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="SP"
                            type="number"
                            value={formData.sp || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sp: Number(e.target.value) }))}
                            inputProps={{ step: "0.01" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            type="date"
                            label="Date"
                            value={formData.date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            label="Sold Rate"
                            type="number"
                            value={formData.sold_rate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sold_rate: Number(e.target.value) }))}
                            inputProps={{ step: "0.01" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            select
                            fullWidth
                            label="Quantity"
                            value={formData.quantity || 1}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        >
                            {[...Array(100)].map((_, i) => (
                                <MenuItem key={i + 1} value={i + 1}>
                                    {i + 1}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Final Amount"
                            type="number"
                            value={formData.final_amount || 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, final_amount: Number(e.target.value) }))}
                            inputProps={{ step: "0.01" }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" color="primary">
                                Create Sale
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default NewSale; 
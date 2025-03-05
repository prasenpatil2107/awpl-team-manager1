import React, { useState } from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Product, Sale } from '../types';

interface ProductRow {
    product_id?: number;
    product_name?: string;
    mrp: number;
    dp: number;
    sp: number;
    sold_rate: number;
    quantity: number;
    final_amount: number;
}

interface MultiProductSaleFormProps {
    products: Product[];
    userId: number;
    onSubmit: (sales: Partial<Sale>[]) => void;
}

const MultiProductSaleForm: React.FC<MultiProductSaleFormProps> = ({
    products,
    userId,
    onSubmit,
}) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [productRows, setProductRows] = useState<ProductRow[]>([{
        mrp: 0,
        dp: 0,
        sp: 0,
        sold_rate: 0,
        quantity: 1,
        final_amount: 0,
    }]);

    const handleProductChange = (index: number, productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setProductRows(prev => {
                const newRows = [...prev];
                newRows[index] = {
                    ...newRows[index],
                    product_id: productId,
                    product_name: product.product_name,
                    mrp: product.mrp,
                    dp: product.dp,
                    sp: product.sp,
                    sold_rate: product.sp,
                    final_amount: product.sp * newRows[index].quantity
                };
                return newRows;
            });
        }
    };

    const handleRowChange = (index: number, field: keyof ProductRow, value: number) => {
        setProductRows(prev => {
            const newRows = [...prev];
            newRows[index] = {
                ...newRows[index],
                [field]: value,
                final_amount: field === 'quantity' || field === 'sold_rate' 
                    ? value * (field === 'quantity' ? newRows[index].sold_rate : newRows[index].quantity)
                    : newRows[index].final_amount
            };
            return newRows;
        });
    };

    const addProductRow = () => {
        setProductRows(prev => [...prev, {
            mrp: 0,
            dp: 0,
            sp: 0,
            sold_rate: 0,
            quantity: 1,
            final_amount: 0,
        }]);
    };

    const removeProductRow = (index: number) => {
        setProductRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sales = productRows.map(row => ({
            user_id: userId,
            product_id: row.product_id,
            mrp: row.mrp,
            dp: row.dp,
            sp: row.sp,
            date,
            sold_rate: row.sold_rate,
            quantity: row.quantity,
            final_amount: row.final_amount,
        }));
        onSubmit(sales);
    };

    const totalAmount = productRows.reduce((sum, row) => sum + row.final_amount, 0);
    const totalSP = productRows.reduce((sum, row) => sum + row.sp * row.quantity, 0);

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">MRP</TableCell>
                            <TableCell align="right">DP</TableCell>
                            <TableCell align="right">SP</TableCell>
                            <TableCell align="right">Sold Rate</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productRows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        required
                                        select
                                        fullWidth
                                        value={row.product_id || ''}
                                        onChange={(e) => handleProductChange(index, Number(e.target.value))}
                                    >
                                        {products.map((product) => (
                                            <MenuItem key={product.id} value={product.id}>
                                                {product.product_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell align="right">₹{row.mrp.toFixed(2)}</TableCell>
                                <TableCell align="right">₹{row.dp.toFixed(2)}</TableCell>
                                <TableCell align="right">₹{row.sp.toFixed(2)}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={row.sold_rate}
                                        onChange={(e) => handleRowChange(index, 'sold_rate', Number(e.target.value))}
                                        inputProps={{ step: "0.01", min: "0" }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={row.quantity}
                                        onChange={(e) => handleRowChange(index, 'quantity', Number(e.target.value))}
                                        inputProps={{ min: "1" }}
                                    />
                                </TableCell>
                                <TableCell align="right">₹{row.final_amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => removeProductRow(index)}
                                        disabled={productRows.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <strong>Total SP:</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>₹{totalSP.toFixed(2)}</strong>
                            </TableCell>
                            <TableCell colSpan={2} align="right">
                                <strong>Total Amount:</strong>
                            </TableCell>
                            <TableCell align="right">
                                <strong>₹{totalAmount.toFixed(2)}</strong>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={addProductRow}
                    >
                        Add Product
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Create Sales
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default MultiProductSaleForm; 
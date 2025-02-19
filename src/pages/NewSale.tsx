import { useState } from 'react';
import { ProductSale, Product } from '../types/sales';
import { TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const handleSubmit = async (sales: ProductSale[]) => {
    // ... existing code ...
}

// For the user selection, modify the onChange handler:
onChange={(e) => setSelectedUser(Number(e.target.value))} 

const NewSale = () => {
    // ... existing state ...

    const [selectedProducts, setSelectedProducts] = useState<ProductSale[]>([]);

    const handleProductSelect = (product: Product) => {
        setSelectedProducts([...selectedProducts, {
            productId: product.id,
            quantity: 1,
            mrp: product.mrp,
            dp: product.dp,
            sp: product.sp,
            finalPrice: product.sp // Initially set to SP, can be modified
        }]);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].quantity = quantity;
        updatedProducts[index].finalPrice = quantity * updatedProducts[index].sp;
        setSelectedProducts(updatedProducts);
    };

    return (
        <div>
            {/* ... existing user selection ... */}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>MRP</TableCell>
                            <TableCell>DP</TableCell>
                            <TableCell>SP</TableCell>
                            <TableCell>Final Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedProducts.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {products.find(p => p.id === product.productId)?.name}
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                        inputProps={{ min: 1 }}
                                    />
                                </TableCell>
                                <TableCell>{product.mrp}</TableCell>
                                <TableCell>{product.dp}</TableCell>
                                <TableCell>{product.sp}</TableCell>
                                <TableCell>{product.finalPrice}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Product selection */}
            <Select
                value=""
                onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    if (product) handleProductSelect(product);
                }}
            >
                {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                        {product.name}
                    </MenuItem>
                ))}
            </Select>
        </div>
    );
};

export default NewSale; 
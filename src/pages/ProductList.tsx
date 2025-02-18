import React, { useState, useEffect } from 'react';
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
    TextField,
    Grid,
    IconButton,
    Stack,
} from '@mui/material';
import { Add as AddIcon, Launch as LaunchIcon, FileUpload as FileUploadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { Product } from '../types';
import { productApi } from '../services/api';
import TableHeader from '../components/TableHeader';
import TableToolbar from '../components/TableToolbar';
import { useTableFeatures } from '../hooks/useTableFeatures';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { validateProduct } from '../utils/validation';
import TablePagination from '../components/TablePagination';
import Debug from '../components/Debug';
import { exportToExcel, importFromExcel, validateProductImport } from '../utils/importExport';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const {
        items: filteredProducts,
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
    } = useTableFeatures<Product>(products, { 
        defaultSort: {
            key: 'product_name',
            direction: 'asc'
        },
        defaultPageSize: 10 
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll();
            console.log('Product API response:', response); // Debug log
            console.log('Products data:', response.data.data); // Debug log
            setProducts(response.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Failed to load products:', error);
            setError('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateProduct(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                await productApi.create(formData);
                setOpenDialog(false);
                setFormData({});
                loadProducts();
            } catch (error) {
                console.error('Failed to create product:', error);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setOpenDialog(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateProduct(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                if (editingProduct) {
                    // Update existing product
                    await productApi.update(editingProduct.id!, formData);
                } else {
                    // Create new product
                    await productApi.create(formData);
                }
                setOpenDialog(false);
                setFormData({});
                setEditingProduct(null);
                loadProducts();
            } catch (error) {
                console.error('Failed to save product:', error);
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData({});
        setFormErrors({});
        setEditingProduct(null);
    };

    const handleLinkClick = (e: React.MouseEvent, link?: string) => {
        e.stopPropagation(); // Prevent row click event
        if (link) {
            window.open(link, '_blank');
        }
    };

    const handleExport = () => {
        const exportData = products.map(product => ({
            product_name: product.product_name,
            mrp: product.mrp,
            dp: product.dp,
            sp: product.sp,
            description: product.description || '',
            link: product.link || '',
        }));
        exportToExcel(exportData, 'products_export');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const jsonData = await importFromExcel(file);
            const validatedData = jsonData.map(validateProductImport);

            // Create all products
            for (const product of validatedData) {
                await productApi.create(product);
            }

            loadProducts(); // Reload the products list
            setError(null);
        } catch (error) {
            console.error('Import failed:', error);
            setError('Failed to import products');
        }

        // Reset the file input
        event.target.value = '';
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Products</Typography>
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
                        Add Product
                    </Button>
                </Stack>
            </Box>

            <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={[]}
                activeFilters={filters}
                onFilterChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader
                                label="Product Name"
                                field="product_name"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                            />
                            <TableHeader
                                label="MRP"
                                field="mrp"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                                align="right"
                            />
                            <TableHeader
                                label="DP"
                                field="dp"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                                align="right"
                            />
                            <TableHeader
                                label="SP"
                                field="sp"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                                align="right"
                            />
                            <TableHeader
                                label="Description"
                                field="description"
                                sortConfig={sortConfig}
                                onSort={requestSort}
                            />
                            <TableCell>Link</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow 
                                key={product.id}
                                hover
                                onClick={() => handleEditClick(product)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>{product.product_name}</TableCell>
                                <TableCell align="right">₹{product.mrp.toFixed(2)}</TableCell>
                                <TableCell align="right">₹{product.dp.toFixed(2)}</TableCell>
                                <TableCell align="right">₹{product.sp.toFixed(2)}</TableCell>
                                <TableCell>{product.description || '-'}</TableCell>
                                <TableCell>
                                    {product.link ? (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleLinkClick(e, product.link)}
                                            title={product.link}
                                        >
                                            <LaunchIcon />
                                        </IconButton>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No products found
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

            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Product Name"
                                    name="product_name"
                                    value={formData.product_name || ''}
                                    onChange={handleChange}
                                    error={!!formErrors.product_name}
                                    helperText={formErrors.product_name}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    required
                                    fullWidth
                                    type="number"
                                    label="MRP"
                                    name="mrp"
                                    value={formData.mrp || ''}
                                    onChange={handleChange}
                                    inputProps={{ step: "0.01" }}
                                    error={!!formErrors.mrp}
                                    helperText={formErrors.mrp}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    required
                                    fullWidth
                                    type="number"
                                    label="DP"
                                    name="dp"
                                    value={formData.dp || ''}
                                    onChange={handleChange}
                                    inputProps={{ step: "0.01" }}
                                    error={!!formErrors.dp}
                                    helperText={formErrors.dp}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    required
                                    fullWidth
                                    type="number"
                                    label="SP"
                                    name="sp"
                                    value={formData.sp || ''}
                                    onChange={handleChange}
                                    inputProps={{ step: "0.01" }}
                                    error={!!formErrors.sp}
                                    helperText={formErrors.sp}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    error={!!formErrors.description}
                                    helperText={formErrors.description}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="External Link"
                                    name="link"
                                    value={formData.link || ''}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                    helperText="Optional: Add a link to external product page"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button type="submit" variant="contained" color="primary">
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>

            <Debug data={{ products, filteredProducts }} label="Products State" />
        </>
    );
};

export default ProductList; 
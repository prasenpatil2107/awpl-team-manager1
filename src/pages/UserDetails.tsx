import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Paper,
    Grid,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { User, Sale, Payment, SaleFormData, Prescription } from '../types';
import { userApi, saleApi, paymentApi, prescriptionApi } from '../services/api';
import TableToolbar from '../components/TableToolbar';
import TableHeader from '../components/TableHeader';
import TablePagination from '../components/TablePagination';
import { useTableFeatures } from '../hooks/useTableFeatures';
import ExportButton from '../components/ExportButton';
import { exportToExcel } from '../utils/export';
import UserForm from '../components/UserForm';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import UserBalanceHistoryPDF from '../components/UserBalanceHistoryPDF';
import PrescriptionPDF from '../components/PrescriptionPDF';
import PrescriptionForm from '../components/PrescriptionForm';

interface UserNode extends User {
    children?: UserNode[];
}

interface UserDetailsData {
    user: User;
    sales: Sale[];
    payments: Payment[];
    summary: {
        totalPurchases: number;
        totalPaid: number;
        balanceAmount: number;
        totalSP: number;
    };
}

const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [userDetails, setUserDetails] = useState<UserDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [users, setUsers] = useState<User[]>([]); // For UserForm component
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [saleFormData, setSaleFormData] = useState<SaleFormData>({});
    const [openSaleDialog, setOpenSaleDialog] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [paymentFormData, setPaymentFormData] = useState<Partial<Payment>>({});
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    const {
        items: filteredSales,
        totalItems: totalSales,
        page: salesPage,
        setPage: setSalesPage,
        pageSize: salesPageSize,
        setPageSize: setSalesPageSize,
        requestSort: requestSalesSort,
        sortConfig: salesSortConfig,
        searchTerm: salesSearchTerm,
        setSearchTerm: setSalesSearchTerm,
    } = useTableFeatures<Sale>(userDetails?.sales || [], {
        defaultSort: { key: 'date', direction: 'desc' },
        defaultPageSize: 5,
    });

    const {
        items: filteredPayments,
        totalItems: totalPayments,
        page: paymentsPage,
        setPage: setPaymentsPage,
        pageSize: paymentsPageSize,
        setPageSize: setPaymentsPageSize,
        requestSort: requestPaymentsSort,
        sortConfig: paymentsSortConfig,
        searchTerm: paymentsSearchTerm,
        setSearchTerm: setPaymentsSearchTerm,
    } = useTableFeatures<Payment>(userDetails?.payments || [], {
        defaultSort: { key: 'date', direction: 'desc' },
        defaultPageSize: 5,
    });

    useEffect(() => {
        if (id) {
            loadUserDetails(parseInt(id));
            loadUsers();
            loadPrescriptions();
        }
    }, [id]);

    const loadUserDetails = async (userId: number) => {
        try {
            setLoading(true);
            const response = await userApi.getUserDetails(userId);
            setUserDetails(response.data.data);
            console.log('UserDetails after setState:', userDetails); // This might show old value due to closure
            // Use useEffect to log state changes
            setError(null);
        } catch (error) {
            setError('Failed to load user details');
            console.error('Failed to load user details:', error);
            setUserDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await userApi.getAll();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadPrescriptions = async () => {
        try {
            const response = await prescriptionApi.getByUser(parseInt(id!));
            setPrescriptions(response.data.data || []);
        } catch (error) {
            console.error('Failed to load prescriptions:', error);
        }
    };

    const handleEditUser = async (updatedUser: Partial<User>) => {
        if (!id) return;
        
        try {
            await userApi.update(parseInt(id), updatedUser);
            setOpenEditDialog(false);
            loadUserDetails(parseInt(id));
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleExportSales = () => {
        if (!userDetails) return;

        const headers: Partial<Record<keyof Sale, string>> = {
            date: 'Date',
            product_id: 'Product',
            quantity: 'Quantity',
            sold_rate: 'Rate',
            final_amount: 'Amount',
        };

        const exportData = userDetails.sales.map(sale => ({
            ...sale,
            date: new Date(sale.date).toLocaleDateString(),
        })); 

        // Always export as Excel since we removed CSV option
        exportToExcel(exportData, `sales_${userDetails.user.name}`, headers);
    };

    // Add this useEffect to monitor userDetails changes
    useEffect(() => {
        console.log('UserDetails updated:', userDetails);
    }, [userDetails]);

    const handleDeleteSale = async (saleId: number) => {
        if (!window.confirm('Are you sure you want to delete this sale?')) return;
        
        try {
            await saleApi.delete(saleId);
            loadUserDetails(parseInt(id!));
        } catch (error) {
            console.error('Failed to delete sale:', error);
        }
    };

    const handleEditSale = (sale: Sale) => {
        setEditingSale(sale);
        setSaleFormData({
            product_name: sale.product_name,
            mrp: sale.mrp,
            dp: sale.dp,
            sp: sale.sp,
            quantity: sale.quantity,
            sold_rate: sale.sold_rate,
            final_amount: sale.final_amount,
            date: sale.date,
        });
        setOpenSaleDialog(true);
    };

    const handleSaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSaleFormData(prev => {
            const newData: SaleFormData = { 
                ...prev, 
                [name]: name === 'date' ? value : Number(value) 
            };
            
            // Only auto-calculate final amount if quantity or sold_rate changes
            // and final_amount hasn't been manually edited
            if ((name === 'quantity' || name === 'sold_rate') && !prev.finalAmountEdited) {
                newData.final_amount = (newData.quantity || 0) * (newData.sold_rate || 0);
            }
            
            // If final_amount is being edited directly, mark it as manually edited
            if (name === 'final_amount') {
                newData.finalAmountEdited = true;
            }
            
            return newData;
        });
    };

    const handleSaleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSale) return;

        try {
            console.log('Submitting sale update:', editingSale.id, saleFormData); // Debug log
            const response = await saleApi.update(editingSale.id!, {
                quantity: saleFormData.quantity,
                sold_rate: saleFormData.sold_rate,
                final_amount: saleFormData.final_amount,
                sp: saleFormData.sp,
                date: saleFormData.date
            });
            
            console.log('Update response:', response); // Debug log
            setOpenSaleDialog(false);
            loadUserDetails(parseInt(id!));
        } catch (error) {
            console.error('Failed to update sale:', error);
        }
    };

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);
        setPaymentFormData({
            amount: payment.amount,
            date: payment.date
        });
        setOpenPaymentDialog(true);
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({
            ...prev,
            [name]: name === 'date' ? value : Number(value)
        }));
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPayment) return;

        try {
            await paymentApi.update(editingPayment.id!, paymentFormData);
            setOpenPaymentDialog(false);
            loadUserDetails(parseInt(id!));
        } catch (error) {
            console.error('Failed to update payment:', error);
        }
    };

    const handleDeletePayment = async (paymentId: number) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) return;
        
        try {
            await paymentApi.delete(paymentId);
            loadUserDetails(parseInt(id!));
        } catch (error) {
            console.error('Failed to delete payment:', error);
        }
    };

    const handleEditPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setOpenPrescriptionDialog(true);
    };

    const handleDeletePrescription = async (prescriptionId: number) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await prescriptionApi.delete(prescriptionId);
                setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
            } catch (error) {
                console.error('Failed to delete prescription:', error);
            }
        }
    };

    console.log(userDetails,"userDetails");
    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userDetails) return <Typography>User not found</Typography>;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">User Details</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setOpenEditDialog(true)}
                            >
                                Edit User
                            </Button>
                            <BlobProvider document={<UserBalanceHistoryPDF data={userDetails} />}>
                                {({ blob, url, loading }) => (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<DownloadIcon />}
                                        disabled={loading}
                                        href={url || '#'}
                                        download={`${userDetails.user.name}_balance_history.pdf`}
                                    >
                                        {loading ? 'Preparing PDF...' : 'Download PDF'}
                                    </Button>
                                )}
                            </BlobProvider>
                        </Box>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                                <strong>Name:</strong> {userDetails.user.name}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Leg:</strong> {userDetails.user.leg || 'None'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Mobile:</strong> {userDetails.user.mobile_no || '-'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Address:</strong> {userDetails.user.address || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                                <strong>Work:</strong> {userDetails.user.work || '-'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Remarks:</strong> {userDetails.user.remarks || '-'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total SP:</strong> ₹{userDetails.summary.totalSP.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Purchases:</strong> ₹{userDetails.summary.totalPurchases.toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Paid:</strong> ₹{userDetails.summary.totalPaid.toFixed(2)}
                            </Typography>
                            <Typography variant="body1" color={userDetails.summary.balanceAmount > 0 ? 'error' : 'success'}>
                                <strong>Balance Amount:</strong> ₹{userDetails.summary.balanceAmount.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Purchase History</Typography>
                        <ExportButton onExport={handleExportSales} />
                    </Box>

                    <TableToolbar
                        searchTerm={salesSearchTerm}
                        onSearchChange={setSalesSearchTerm}
                        filters={[]}
                        activeFilters={{}}
                        onFilterChange={() => {}}
                    />

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableHeader
                                        label="Date"
                                        field="date"
                                        sortConfig={salesSortConfig}
                                        onSort={requestSalesSort}
                                    />
                                    <TableHeader
                                        label="Product"
                                        field="product_name"
                                        sortConfig={salesSortConfig}
                                        onSort={requestSalesSort}
                                    />
                                    <TableHeader
                                        label="Quantity"
                                        field="quantity"
                                        sortConfig={salesSortConfig}
                                        onSort={requestSalesSort}
                                        align="right"
                                    />
                                    <TableHeader
                                        label="SP"
                                        field="sp"
                                        sortConfig={salesSortConfig}
                                        onSort={requestSalesSort}
                                        align="right"
                                    />
                                    <TableHeader
                                        label="Amount"
                                        field="final_amount"
                                        sortConfig={salesSortConfig}
                                        onSort={requestSalesSort}
                                        align="right"
                                    />
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.product_name}</TableCell>
                                        <TableCell align="right">{sale.quantity}</TableCell>
                                        <TableCell align="right">₹{(sale.sp * sale.quantity).toFixed(2)}</TableCell>
                                        <TableCell align="right">₹{sale.final_amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditSale(sale)}
                                                title="Edit sale"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteSale(sale.id!)}
                                                title="Delete sale"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredSales.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No purchase history found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        count={totalSales}
                        page={salesPage}
                        rowsPerPage={salesPageSize}
                        onPageChange={setSalesPage}
                        onRowsPerPageChange={setSalesPageSize}
                    />
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Payment History
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userDetails.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">₹{payment.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditPayment(payment)}
                                                title="Edit payment"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeletePayment(payment.id!)}
                                                title="Delete payment"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Prescriptions
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Medicines</TableCell>
                                        <TableCell>Remarks</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prescriptions.map((prescription) => (
                                        <TableRow key={prescription.id}>
                                            <TableCell>
                                                {new Date(prescription.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {prescription.medicines.map(m => m.product_name).join(', ')}
                                            </TableCell>
                                            <TableCell>{prescription.remarks}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEditPrescription(prescription)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => prescription.id && handleDeletePrescription(prescription.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <BlobProvider document={
                                                    <PrescriptionPDF data={{
                                                        patientName: userDetails.user.name,
                                                        patientMobile: userDetails.user.mobile_no || '',
                                                        patientAddress: userDetails.user.address || '',
                                                        date: prescription.date,
                                                        medicines: prescription.medicines,
                                                        remarks: prescription.remarks
                                                    }} />
                                                }>
                                                    {({ url }) => (
                                                        <IconButton
                                                            size="small"
                                                            href={url || '#'}
                                                            download={`prescription_${userDetails.user.name}_${prescription.date}.pdf`}
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    )}
                                                </BlobProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <UserForm
                        user={userDetails.user}
                        users={users.filter(u => u.id !== parseInt(id!))}
                        onSubmit={handleEditUser}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openSaleDialog} onClose={() => setOpenSaleDialog(false)}>
                <DialogTitle>Edit Sale</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSaleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Product"
                                    value={saleFormData.product_name || ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="MRP"
                                    value={saleFormData.mrp || ''}
                                    disabled
                                    InputProps={{
                                        startAdornment: <span>₹</span>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="DP"
                                    value={saleFormData.dp || ''}
                                    disabled
                                    InputProps={{
                                        startAdornment: <span>₹</span>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="SP"
                                    value={saleFormData.sp || ''}
                                    disabled
                                    InputProps={{
                                        startAdornment: <span>₹</span>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={saleFormData.date || ''}
                                    onChange={handleSaleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    value={saleFormData.quantity || ''}
                                    onChange={handleSaleChange}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Sold Rate"
                                    name="sold_rate"
                                    type="number"
                                    value={saleFormData.sold_rate || ''}
                                    onChange={handleSaleChange}
                                    inputProps={{ step: "0.01" }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Final Amount"
                                    value={saleFormData.final_amount || ''}
                                    disabled
                                    InputProps={{
                                        startAdornment: <span>₹</span>
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <DialogActions>
                            <Button onClick={() => setOpenSaleDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained">Update</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
                <DialogTitle>Edit Payment</DialogTitle>
                <DialogContent>
                    <form onSubmit={handlePaymentSubmit}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={paymentFormData.date || ''}
                                    onChange={handlePaymentChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    value={paymentFormData.amount || ''}
                                    onChange={handlePaymentChange}
                                    inputProps={{ step: "0.01" }}
                                />
                            </Grid>
                        </Grid>
                        <DialogActions>
                            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained">Update</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog 
                open={openPrescriptionDialog} 
                onClose={() => setOpenPrescriptionDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Prescription</DialogTitle>
                <DialogContent>
                    {selectedPrescription && (
                        <PrescriptionForm 
                            initialData={selectedPrescription}
                            onSave={async (updatedPrescription: Prescription) => {
                                try {
                                    await prescriptionApi.update(selectedPrescription.id!, updatedPrescription);
                                    const prescriptionsResponse = await prescriptionApi.getByUser(Number(id));
                                    setPrescriptions(prescriptionsResponse.data.data || []);
                                    setOpenPrescriptionDialog(false);
                                } catch (error) {
                                    console.error('Failed to update prescription:', error);
                                }
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

export default UserDetails; 
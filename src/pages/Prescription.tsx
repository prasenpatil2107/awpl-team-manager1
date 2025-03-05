import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { User, Product } from '../types';
import { userApi, productApi, prescriptionApi } from '../services/api';
import { BlobProvider } from '@react-pdf/renderer';
import PrescriptionPDF from '../components/PrescriptionPDF';
import { Prescription as PrescriptionType } from '../types';

interface MedicineRow {
    product_id?: number;
    product_name?: string;
    morning_dose: string;
    evening_dose: string;
}

const Prescription: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [medicines, setMedicines] = useState<MedicineRow[]>([{
        morning_dose: '',
        evening_dose: ''
    }]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersResponse, productsResponse] = await Promise.all([
                userApi.getAll(),
                productApi.getAll()
            ]);
            
            setUsers(usersResponse.data.data || []);
            setProducts(productsResponse.data.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleProductChange = (index: number, productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setMedicines(prev => {
                const newRows = [...prev];
                newRows[index] = {
                    ...newRows[index],
                    product_id: productId,
                    product_name: product.product_name
                };
                return newRows;
            });
        }
    };

    const handleDoseChange = (index: number, field: 'morning_dose' | 'evening_dose', value: string) => {
        setMedicines(prev => {
            const newRows = [...prev];
            newRows[index] = {
                ...newRows[index],
                [field]: value
            };
            return newRows;
        });
    };

    const addMedicineRow = () => {
        setMedicines(prev => [...prev, {
            morning_dose: '',
            evening_dose: ''
        }]);
    };

    const removeMedicineRow = (index: number) => {
        setMedicines(prev => prev.filter((_, i) => i !== index));
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    const prescriptionData = {
        patientName: selectedUser?.name || '',
        patientMobile: selectedUser?.mobile_no || '',
        patientAddress: selectedUser?.address || '',
        date,
        medicines,
        remarks
    };

    const handleSave = async () => {
        if (!selectedUserId) return;

        const prescription: PrescriptionType = {
            user_id: selectedUserId,
            date,
            remarks,
            medicines: medicines.map(m => ({
                product_id: m.product_id!,
                morning_dose: m.morning_dose,
                evening_dose: m.evening_dose
            }))
        };

        try {
            await prescriptionApi.create(prescription);
            alert('Prescription saved successfully');
        } catch (error) {
            console.error('Failed to save prescription:', error);
            alert('Failed to save prescription');
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Create Prescription
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        select
                        label="Patient"
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

            <TableContainer sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Morning Dose</TableCell>
                            <TableCell>Evening Dose</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicines.map((row, index) => (
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
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        value={row.morning_dose}
                                        onChange={(e) => handleDoseChange(index, 'morning_dose', e.target.value)}
                                        placeholder="e.g., 1 tablet"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        value={row.evening_dose}
                                        onChange={(e) => handleDoseChange(index, 'evening_dose', e.target.value)}
                                        placeholder="e.g., 1 tablet"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => removeMedicineRow(index)}
                                        disabled={medicines.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={addMedicineRow}
                >
                    Add Medicine
                </Button>
                
                <BlobProvider document={<PrescriptionPDF data={prescriptionData} />}>
                    {({ blob, url, loading }) => (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            disabled={loading || !selectedUserId}
                            href={url || '#'}
                            download={`prescription_${selectedUser?.name || 'patient'}.pdf`}
                        >
                            {loading ? 'Preparing PDF...' : 'Download Prescription'}
                        </Button>
                    )}
                </BlobProvider>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={!selectedUserId}
                >
                    Save Prescription
                </Button>
            </Box>
        </Paper>
    );
};

export default Prescription; 
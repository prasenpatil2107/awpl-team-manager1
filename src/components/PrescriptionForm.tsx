import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Product, Prescription } from '../types';
import { productApi } from '../services/api';
import SearchableSelect from './SearchableSelect';

interface PrescriptionFormProps {
    initialData: Prescription;
    onSave: (prescription: Prescription) => Promise<void>;
}

interface MedicineRow {
    product_id?: number;
    product_name?: string;
    morning_dose: string;
    evening_dose: string;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ initialData, onSave }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [date, setDate] = useState(initialData.date);
    const [remarks, setRemarks] = useState(initialData.remarks);
    const [medicines, setMedicines] = useState<MedicineRow[]>(
        initialData.medicines.map(m => ({
            product_id: m.product_id,
            product_name: m.product_name,
            morning_dose: m.morning_dose,
            evening_dose: m.evening_dose
        }))
    );

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productApi.getAll();
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            ...initialData,
            date,
            remarks,
            medicines: medicines.map(m => ({
                product_id: m.product_id!,
                morning_dose: m.morning_dose,
                evening_dose: m.evening_dose
            }))
        });
    };

    const productOptions = products.map(product => ({
        id: product.id!,
        label: product.product_name
    }));

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>

            <TableContainer sx={{ mt: 2 }}>
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
                                    <SearchableSelect
                                        label="Product"
                                        options={productOptions}
                                        value={row.product_id || ''}
                                        onChange={(value) => handleProductChange(index, Number(value))}
                                    />
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

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="outlined" onClick={addMedicineRow} sx={{ mr: 1 }}>
                        Add Medicine
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Save Changes
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default PrescriptionForm; 
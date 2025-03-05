import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    header: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    patientInfo: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '25%',
        fontFamily: 'Helvetica-Bold',
    },
    value: {
        width: '75%',
    },
    table: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 8,
        fontFamily: 'Helvetica-Bold',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    col1: { 
        width: '40%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        paddingRight: 5,
    },
    col2: { 
        width: '30%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        paddingLeft: 5,
        paddingRight: 5,
    },
    col3: { 
        width: '30%',
        paddingLeft: 5,
    },
    remarks: {
        marginTop: 20,
    },
    remarksTitle: {
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
    },
});

interface PrescriptionPDFProps {
    data: {
        patientName: string;
        patientMobile: string;
        patientAddress: string;
        date: string;
        medicines: {
            product_name?: string;
            morning_dose: string;
            evening_dose: string;
        }[];
        remarks: string;
    };
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>AWPL Prescription</Text>

            <View style={styles.patientInfo}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Patient Name:</Text>
                    <Text style={styles.value}>{data.patientName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Mobile:</Text>
                    <Text style={styles.value}>{data.patientMobile}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{data.patientAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>
                        {new Date(data.date).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Medicine</Text>
                    <Text style={styles.col2}>Morning</Text>
                    <Text style={styles.col3}>Evening</Text>
                </View>
                {data.medicines.map((medicine, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.col1}>{medicine.product_name}</Text>
                        <Text style={styles.col2}>{medicine.morning_dose}</Text>
                        <Text style={styles.col3}>{medicine.evening_dose}</Text>
                    </View>
                ))}
            </View>

            {data.remarks && (
                <View style={styles.remarks}>
                    <Text style={styles.remarksTitle}>Remarks:</Text>
                    <Text>{data.remarks}</Text>
                </View>
            )}
        </Page>
    </Document>
);

export default PrescriptionPDF; 
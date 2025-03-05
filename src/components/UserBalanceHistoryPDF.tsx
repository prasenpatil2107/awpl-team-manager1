import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { UserDetailsData } from '../types';

// Register a font for bold text
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT0kLW-43aMEzIO6XUTLjad8.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    section: {
        marginBottom: 20,
    },
    header: {
        fontSize: 14,
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        width: '30%',
        fontFamily: 'Helvetica-Bold',
    },
    value: {
        width: '70%',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 5,
        fontFamily: 'Helvetica-Bold',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    col15: { width: '15%' },
    col20: { width: '20%' },
    col25: { width: '25%' },
    col30: { width: '30%' },
    col70: { width: '70%' },
    col75: { width: '75%' },
    col80: { width: '80%' },
    alignRight: { textAlign: 'right' },
    total: {
        flexDirection: 'row',
        padding: 5,
        marginTop: 10,
        fontFamily: 'Helvetica-Bold',
    },
});

interface UserBalanceHistoryPDFProps {
    data: UserDetailsData;
}

const UserBalanceHistoryPDF: React.FC<UserBalanceHistoryPDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>AWPL Balance History</Text>

            {/* User Details Section */}
            <View style={styles.section}>
                <Text style={styles.header}>User Details</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{data.user.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Mobile:</Text>
                    <Text style={styles.value}>{data.user.mobile_no || '-'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{data.user.address || '-'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total SP:</Text>
                    <Text style={styles.value}>₹{data.summary.totalSP.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Purchases:</Text>
                    <Text style={styles.value}>₹{data.summary.totalPurchases.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Paid:</Text>
                    <Text style={styles.value}>₹{data.summary.totalPaid.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Balance Amount:</Text>
                    <Text style={styles.value}>₹{data.summary.balanceAmount.toFixed(2)}</Text>
                </View>
            </View>

            {/* Purchase History Section */}
            <View style={styles.section}>
                <Text style={styles.header}>Purchase History</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.col20}>Date</Text>
                    <Text style={styles.col25}>Product</Text>
                    <Text style={[styles.col15, styles.alignRight]}>Quantity</Text>
                    <Text style={[styles.col20, styles.alignRight]}>SP</Text>
                    <Text style={[styles.col20, styles.alignRight]}>Amount</Text>
                </View>
                {data.sales.map((sale, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.col20}>
                            {new Date(sale.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.col25}>{sale.product_name}</Text>
                        <Text style={[styles.col15, styles.alignRight]}>
                            {sale.quantity}
                        </Text>
                        <Text style={[styles.col20, styles.alignRight]}>
                            ₹{(sale.sp * sale.quantity).toFixed(2)}
                        </Text>
                        <Text style={[styles.col20, styles.alignRight]}>
                            ₹{sale.final_amount.toFixed(2)}
                        </Text>
                    </View>
                ))}
                <View style={styles.total}>
                    <Text style={styles.col80}>Total Purchases:</Text>
                    <Text style={[styles.col20, styles.alignRight]}>
                        ₹{data.summary.totalPurchases.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Payment History Section */}
            <View style={styles.section}>
                <Text style={styles.header}>Payment History</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.col30}>Date</Text>
                    <Text style={[styles.col70, styles.alignRight]}>Amount</Text>
                </View>
                {data.payments.map((payment, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.col30}>
                            {new Date(payment.date).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.col70, styles.alignRight]}>
                            ₹{payment.amount.toFixed(2)}
                        </Text>
                    </View>
                ))}
                <View style={styles.total}>
                    <Text style={styles.col75}>Total Payments:</Text>
                    <Text style={[styles.col25, styles.alignRight]}>
                        ₹{data.summary.totalPaid.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Final Balance */}
            <View style={[styles.total, { marginTop: 20 }]}>
                <Text style={styles.col75}>Final Balance Amount:</Text>
                <Text style={[styles.col25, styles.alignRight]}>
                    ₹{data.summary.balanceAmount.toFixed(2)}
                </Text>
            </View>
        </Page>
    </Document>
);

export default UserBalanceHistoryPDF; 
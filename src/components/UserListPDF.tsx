import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { User } from '../types';

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
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'Helvetica-Bold',
    },
    cell: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    nameCell: {
        flex: 2,
    },
    legCell: {
        flex: 1.5,
    },
    mobileCell: {
        flex: 1.5,
    },
    workCell: {
        flex: 1.5,
    },
    addressCell: {
        flex: 1.5,
    },
    useridCell: {
        flex: 1.5,
    },
    passwordCell: {
        flex: 1.5,
    },
    greenRow: {
        backgroundColor: '#e8f5e9',
    } as const,
    spCell: {
        flex: 1,
    },
});

interface UserListPDFProps {
    users: User[];
}

const UserListPDF: React.FC<UserListPDFProps> = ({ users }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            <Text style={styles.title}>AWPL User List</Text>

            <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={[styles.cell, styles.nameCell]}>
                        <Text>Name</Text>
                    </View>
                    <View style={[styles.cell, styles.legCell]}>
                        <Text>Leg</Text>
                    </View>
                    <View style={[styles.cell, styles.mobileCell]}>
                        <Text>Mobile</Text>
                    </View>
                    <View style={[styles.cell, styles.workCell]}>
                        <Text>Work</Text>
                    </View>
                    <View style={[styles.cell, styles.addressCell]}>
                        <Text>Address</Text>
                    </View>
                    <View style={[styles.cell, styles.useridCell]}>
                        <Text>User ID</Text>
                    </View>
                    <View style={[styles.cell, styles.passwordCell]}>
                        <Text>Password</Text>
                    </View>
                    <View style={[styles.cell, styles.spCell]}>
                        <Text>SP Value</Text>
                    </View>
                </View>

                {/* Table Body */}
                {users.map((user, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.tableRow,
                            user.is_green ? styles.greenRow : {}
                        ]}
                    >
                        <View style={[styles.cell, styles.nameCell]}>
                            <Text>{user.name}</Text>
                        </View>
                        <View style={[styles.cell, styles.legCell]}>
                            <Text>{user.leg || 'None'}</Text>
                        </View>
                        <View style={[styles.cell, styles.mobileCell]}>
                            <Text>{user.mobile_no || '-'}</Text>
                        </View>
                        <View style={[styles.cell, styles.workCell]}>
                            <Text>{user.work || '-'}</Text>
                        </View>
                        <View style={[styles.cell, styles.addressCell]}>
                            <Text>{user.address || '-'}</Text>
                        </View>
                        <View style={[styles.cell, styles.useridCell]}>
                            <Text>{user.userid || '-'}</Text>
                        </View>
                        <View style={[styles.cell, styles.passwordCell]}>
                            <Text>{user.password || '-'}</Text>
                        </View>
                        <View style={[styles.cell, styles.spCell]}>
                            <Text>{user.sp_value || '0'}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default UserListPDF; 
import { User, Product } from '../types';
import * as XLSX from 'xlsx';

// Export functions
export const exportToExcel = <T>(data: T[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Import functions
export const importFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

// Validation functions
export const validateProductImport = (data: any): Partial<Product> => {
    return {
        product_name: String(data.product_name || ''),
        mrp: Number(data.mrp || 0),
        dp: Number(data.dp || 0),
        sp: Number(data.sp || 0),
        description: data.description,
        link: data.link,
    };
};

export const validateUserImport = (data: any): Partial<User> => {
    return {
        name: String(data.name || ''),
        leg: data.leg,
        mobile_no: data.mobile_no,
        address: data.address,
        work: data.work,
        remarks: data.remarks,
    };
}; 
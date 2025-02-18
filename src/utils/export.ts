import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToCSV = <T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers: Partial<Record<keyof T, string>>
) => {
    // Convert data to CSV format
    const headerRow = headers ? Object.values(headers).join(',') : Object.keys(data[0]).join(',');
    const dataRows = data.map(item => 
        Object.keys(item)
            .map(key => `"${String(item[key]).replace(/"/g, '""')}"`)
            .join(',')
    );
    
    const csv = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = <T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers: Partial<Record<keyof T, string>>
) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    if (headers) {
        XLSX.utils.sheet_add_aoa(worksheet, [Object.values(headers)], { origin: 'A1' });
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
}; 
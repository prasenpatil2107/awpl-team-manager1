export interface User {
    id?: number;
    name: string;
    leg?: 'Bonus' | 'Incentive' | null;
    added_under_id?: number;
    mobile_no?: string;
    address?: string;
    work?: string;
    remarks?: string;
    userid?: string;
    password?: string;
    sp_value?: number;
    is_green?: boolean;
}

export interface Product {
    id?: number;
    product_name: string;
    mrp: number;
    dp: number;
    sp: number;
    description?: string;
    link?: string;
}

export interface Sale {
    id?: number;
    user_id: number;
    product_id: number;
    product_name?: string;
    mrp: number;
    dp: number;
    sp: number;
    date: string;
    sold_rate: number;
    quantity: number;
    final_amount: number;
}

export interface SaleFormData extends Partial<Sale> {
    finalAmountEdited?: boolean;
}

export interface Payment {
    id?: number;
    user_id: number;
    amount: number;
    date: string;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface UserDetailsData {
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

export interface PrescriptionMedicine {
    id?: number;
    prescription_id?: number;
    product_id: number;
    product_name?: string;
    morning_dose: string;
    evening_dose: string;
}

export interface Prescription {
    id?: number;
    user_id: number;
    date: string;
    remarks: string;
    medicines: PrescriptionMedicine[];
} 
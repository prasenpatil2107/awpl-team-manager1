import { Product } from '../types';

export const validateUser = (user: any) => {
    const errors: { [key: string]: string } = {};

    if (!user.name?.trim()) {
        errors.name = 'Name is required';
    }

    if (user.mobile_no && !/^\d{10}$/.test(user.mobile_no)) {
        errors.mobile_no = 'Mobile number must be 10 digits';
    }

    return errors;
};

export const validateProduct = (product: Partial<Product>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!product.product_name?.trim()) {
        errors.product_name = 'Product name is required';
    }

    // Convert string values to numbers for comparison
    const mrp = Number(product.mrp);
    const dp = Number(product.dp);
    const sp = Number(product.sp);

    if (!mrp || mrp <= 0) {
        errors.mrp = 'MRP must be greater than 0';
    }

    if (!dp || dp <= 0) {
        errors.dp = 'DP must be greater than 0';
    }

    if (!sp || sp <= 0) {
        errors.sp = 'SP must be greater than 0';
    }

    // Compare numeric values
    if (dp > mrp) {
        errors.dp = 'DP cannot be greater than MRP';
    }

    if (sp > mrp) {
        errors.sp = 'SP cannot be greater than MRP';
    }

    return errors;
};

export const validateSale = (sale: any) => {
    const errors: { [key: string]: string } = {};

    if (!sale.user_id) {
        errors.user_id = 'User is required';
    }

    if (!sale.product_id) {
        errors.product_id = 'Product is required';
    }

    if (!sale.quantity || sale.quantity < 1) {
        errors.quantity = 'Quantity must be at least 1';
    }

    if (!sale.sold_rate || sale.sold_rate <= 0) {
        errors.sold_rate = 'Sold rate must be greater than 0';
    }

    if (!sale.date) {
        errors.date = 'Date is required';
    }

    return errors;
};

export const validatePayment = (payment: any) => {
    const errors: { [key: string]: string } = {};

    if (!payment.user_id) {
        errors.user_id = 'User is required';
    }

    if (!payment.amount || payment.amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
    }

    if (!payment.date) {
        errors.date = 'Date is required';
    }

    return errors;
}; 
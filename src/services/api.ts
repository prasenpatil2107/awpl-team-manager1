import axios from 'axios';
import { User, Product, Sale, Payment, ApiResponse, UserDetailsData, Prescription } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

const handleApiError = (error: any) => {
    if (error.response) {
        throw new ApiError(
            error.response.status,
            error.response.data.error || 'An error occurred'
        );
    }
    throw new Error('Network error');
};

export const userApi = {
    getAll: () => api.get<ApiResponse<User[]>>('/users'),
    getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
    create: (user: Partial<User>) => api.post<ApiResponse<User>>('/users', user),
    update: (id: number, user: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, user),
    getDownline: (userId: number) => api.get<ApiResponse<User[]>>(`/users/${userId}/downline`),
    getUnassigned: () => api.get<ApiResponse<User[]>>('/users/unassigned'),
    getUserDetails: (id: number) => api.get<ApiResponse<UserDetailsData>>(`/users/${id}/details`),
};

export const productApi = {
    getAll: () => api.get<ApiResponse<Product[]>>('/products'),
    getById: (id: number) => api.get<ApiResponse<Product>>(`/products/${id}`),
    create: (product: Partial<Product>) => api.post<ApiResponse<Product>>('/products', product),
    update: (id: number, product: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, product),
};

export const saleApi = {
    create: (sale: Partial<Sale>) => api.post<Sale>('/sales', sale),
    getByUser: (userId: number) => api.get<Sale[]>(`/sales/user/${userId}`),
    delete: (id: number) => api.delete(`/sales/${id}`),
    update: (id: number, sale: Partial<Sale>) => api.put<ApiResponse<Sale>>(`/sales/${id}`, sale),
};

export const paymentApi = {
    create: (payment: Partial<Payment>) => api.post<Payment>('/payments', payment),
    getByUser: (userId: number) => api.get<Payment[]>(`/payments/user/${userId}`),
    getUserBalance: (userId: number) => api.get(`/payments/user/${userId}/balance`),
    update: (id: number, payment: Partial<Payment>) => 
        api.put<ApiResponse<Payment>>(`/payments/${id}`, payment),
    delete: (id: number) => api.delete(`/payments/${id}`),
};

export const prescriptionApi = {
    create: (prescription: Prescription) => 
        api.post<ApiResponse<Prescription>>('/prescriptions', prescription),
    getByUser: (userId: number) => 
        api.get<ApiResponse<Prescription[]>>(`/prescriptions/user/${userId}`),
    update: (id: number, prescription: Prescription) => 
        api.put<ApiResponse<Prescription>>(`/prescriptions/${id}`, prescription),
    delete: (id: number) => 
        api.delete(`/prescriptions/${id}`),
}; 
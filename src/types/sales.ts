export interface ProductSale {
    productId: number;
    quantity: number;
    mrp: number;
    dp: number;
    sp: number;
    finalPrice: number;
}

export interface Product {
    id: number;
    name: string;
    mrp: number;
    dp: number;
    sp: number;
} 
import { Product, Seller } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  register: async (data: any): Promise<{ token: string; seller: Seller }> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.error || 'Registration failed');
    }
    return result;
  },

  login: async (data: any): Promise<{ token: string; seller: Seller }> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.error || 'Login failed');
    }
    return result;
  },

  saveProduct: async (product: Partial<Product> & { seller?: string; sellerId?: string }, isNew: boolean = false): Promise<void> => {
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? `${API_URL}/add/products` : `${API_URL}/products/${product.id}`;

    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to save product');
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  deleteProductImage: async (id: string): Promise<{ defaultImage: string }> => {
    const res = await fetch(`${API_URL}/products/${id}/image`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product image');
    return res.json();
  },
};

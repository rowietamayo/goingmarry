
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: 'Brand New' | 'Like New (Worn Once)' | 'Excellent Condition' | 'Very Good Condition' | 'Good Condition' | 'Professionally Cleaned' | 'As Is';
  imageUrl: string;
  seller: string;
  sellerId?: string;
  createdAt?: number;
  isSold?: boolean;
  quantity: number;
  notes?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  boutiqueName: string;
  isAdmin?: boolean;
}

export type Category = 'All' | 'Fashion' | 'Electronics' | 'Home' ;

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'condition';

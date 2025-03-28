// Define special omit for unions
type UnionOmit<T, K extends string | number | symbol> = T extends unknown
  ? Omit<T, K>
  : never;

export interface LoginPayload {
  username: string;
  name: string;
  id: string;
  isadmin: boolean;
  accessToken: string;
  refreshToken: string;
}

export type RefreshToken = {
  id: string;
  token: string;
  expiry_date: string;
  user_id: string;
};

export interface NewOrder {
  products: {
    id: string;
    quantity: number;
  }[];
  email: string;
  name: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
}

export type OrderInDb = Omit<NewOrder, 'products'> & {
  id: string;
};

export interface OrderFromDb {
  id: string;
  email: string;
  name: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  Products: [
    {
      id: string;
      title: string;
      price: number;
      instock: number;
      ProductOrder: {
        quantity: number;
      };
    }
  ];
}

export type OrderForFrontend = Omit<OrderFromDb, 'Products'> & {
  Products: [
    {
      id: string;
      title: string;
      price: number;
      instock: number;
      quantity: number;
    }
  ];
};

export type CartItems = Pick<NewOrder, 'products'>;

// Types for reviews, products and users
export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  name: string;
  title: string;
  content: string;
  rating: number;
};

export type NewReview = Omit<Review, 'id' | 'user_id' | 'name'>;

export type EditedReview = Pick<Review, 'title' | 'content' | 'rating'>;

export interface User {
  id: string;
  username: string;
  name: string;
  passwordhash: string | null;
  isadmin: boolean;
}

export type UserWithoutHash = Omit<User, 'passwordhash'>;

export interface NewUser {
  username: string;
  name: string;
  password: string;
  isadmin: boolean;
}

export interface BaseProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  imgs?: string[];
  specs: string[];
  instock: number;
  eta?: number;
  original_id?: string;
  rating?: number;
  reviews?: Review[];
}

export interface Mobile extends BaseProduct {
  category: 'Mobiles';
  popular?: boolean;
  brand: string;
  ram: string;
}

export interface FurnitureItem extends BaseProduct {
  category: 'Furniture';
  popular?: boolean;
  type: string;
}

export interface Laptop extends BaseProduct {
  category: 'Laptops';
  popular?: boolean;
  for: string;
  brand: string;
  ram: string;
  processor: string;
  displaysize: string;
  has_ssd: string;
}

export type Product = Mobile | FurnitureItem | Laptop;

export enum ProductCategory {
  Mobiles = 'Mobiles',
  Furniture = 'Furniture',
  Laptops = 'Laptops'
}

export type ProductWithoutReviews = UnionOmit<Product, 'reviews'>;

// Types for Express controllers
export interface ProductSearchParameters {
  limit?: number;
  include?: object;
  where?: object;
}

export interface ProductQueryParameters {
  limit?: number;
  withReviews?: string;
  category?: string;
  search?: string;
  lowestPrice?: number;
  highestPrice?: number;
  instock?: string;
  lowestRating?: number;
  highestRating?: number;
}

// Error types
export class TypeNarrowingError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'TypeNarrowingError';
  }
}

export class RefreshTokenExpiredError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'RefreshTokenExpiredError';
  }
}
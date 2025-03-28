import { AxiosError } from 'axios';

// Type for API error response for use in service modules
export interface ApiErrorResponse extends AxiosError {
  Error: string;
}

// Type for deleting items from backend on Admin page
export interface ItemToDelete {
  type: 'products' | 'users' | 'orders';
  id: string;
}

export interface NewUser {
  username: string;
  name: string;
  password: string;
  isadmin: boolean;
}

export type UserFromBackend = Omit<NewUser, 'password'> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export interface LoginCredentials {
  username: string;
  password: string;
}

// Type for API response for successful login
export interface LoginPayload {
  username: string;
  name: string;
  id: string;
  isadmin: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  name: string;
  title: string;
  content: string;
  rating: number;
}

export type ReviewFromBackend = Review & {
  ProductId: string;
  UserId: string;
  createdAt: string;
  updatedAt: string;
};

export type NewReview = Omit<Review, 'id' | 'user_id' | 'name'>;

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
  Products: {
    id: string;
    quantity: number;
  }[];
};

export interface OrderFromBackend {
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
      quantity: number;
    }
  ];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartItemForBackend {
  id: string;
  quantity: number;
}

export type CartState = CartItem[] | [];

export interface BaseProduct {
  id: string;
  title: string;
  lowerCaseTitle?: string;
  category: ProductCategory;
  price: number;
  imgs?: string[];
  specs: string[];
  instock: number;
  eta?: number;
  original_id?: string;
  rating?: number;
  Reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export type NewProduct = Pick<
  BaseProduct,
  'category' | 'title' | 'price' | 'instock'
> & {
  specs: string | string[];
};

export type EditedProduct = Pick<BaseProduct, 'title' | 'price' | 'instock'>;

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

export type ProductCategory = 'Mobiles' | 'Furniture' | 'Laptops';

export type ProductSortOption =
  | 'nameAsc'
  | 'nameDesc'
  | 'priceAsc'
  | 'priceDesc'
  | 'ratingAsc'
  | 'ratingDesc';

export interface ProductFilterState {
  lowestPrice?: number;
  highestPrice?: number;
  lowestRating?: number;
  highestRating?: number;
  instock?: boolean;
}

export interface ProductQuery {
  searchTerm?: string;
  productCategory?: ProductCategory;
  filterQuery?: string;
}

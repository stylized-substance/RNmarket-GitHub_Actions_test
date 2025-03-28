import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer
} from 'react';

import orderBy from 'lodash/orderBy';
import {
  Product,
  ProductSortOption,
  ProductFilterState
} from '#src/types/types';

type Action =
  | {
      type: 'added';
      payload: Product[];
    }
  | {
      type: 'sorted';
      payload: {
        sortOption: ProductSortOption;
      };
    }
  | {
      type: 'filtered';
      payload: {
        filter: ProductFilterState;
      };
    }
  | {
      type: 'filterReset';
    };

interface ProductContextType {
  state: {
    products: Product[] | [];
    sortOption: ProductSortOption;
    filter: ProductFilterState;
  };
  dispatch: React.Dispatch<Action>;
}

const ProductContext = createContext<ProductContextType | null>(null);

const initialState: ProductContextType['state'] = {
  products: [],
  sortOption: 'nameAsc',
  filter: {
    lowestPrice: 0,
    highestPrice: 10000,
    lowestRating: 1,
    highestRating: 5,
    instock: false
  }
};

const productReducer = (
  state: ProductContextType['state'],
  action: Action
): ProductContextType['state'] => {
  switch (action.type) {
    case 'added': {
      return { ...state, products: action.payload };
    }
    case 'sorted': {
      // Temporarily add lowercase titles to products so orderBy function works properly when sorting by name
      const lowerCaseProducts = state.products.map((prod) => ({
        ...prod,
        lowerCaseTitle: prod.title.toLowerCase()
      }));

      let sortedProducts;
      switch (action.payload.sortOption) {
        case 'nameAsc':
          sortedProducts = orderBy(
            lowerCaseProducts,
            ['lowerCaseTitle'],
            ['asc']
          );
          break;
        case 'nameDesc':
          sortedProducts = orderBy(
            lowerCaseProducts,
            ['lowerCaseTitle'],
            ['desc']
          );
          break;
        case 'priceAsc':
          sortedProducts = orderBy(state.products, ['price'], ['asc']);
          break;
        case 'priceDesc':
          sortedProducts = orderBy(state.products, ['price'], ['desc']);
          break;
        case 'ratingAsc':
          sortedProducts = orderBy(state.products, ['rating'], ['asc']);
          break;
        case 'ratingDesc':
          sortedProducts = orderBy(state.products, ['rating'], ['desc']);
          break;
        default: {
          const _exhaustiveCheck: never = action.payload.sortOption;
          return _exhaustiveCheck;
        }
      }

      // Discard lowercase titles
      const mappedProducts = sortedProducts.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ lowerCaseTitle, ...rest }) => rest
      );

      return { ...state, products: mappedProducts };
    }
    case 'filtered': {
      return { ...state, filter: action.payload.filter };
    }
    case 'filterReset': {
      return { ...state, filter: initialState.filter };
    }
    default: {
      throw new Error('productReducer was called with an unknown action type');
    }
  }
};

const ProductContextProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error('useProducts must be used within a ProductContextProvider');
  }

  return context;
};

export default ProductContextProvider;

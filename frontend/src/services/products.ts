import { backendAddress } from '#src/utils/config';
import axios from 'axios';
import { NewProduct, Product, ProductQuery } from '../types/types';
import { isApiErrorResponse, isString } from '#src/utils/typeNarrowers';

const baseUrl = process.env.NODE_ENV === 'production' ? '/api/products' : `${backendAddress}/api/products`;

const getAll = async ({
  searchTerm,
  productCategory,
  filterQuery
}: ProductQuery): Promise<Product[] | []> => {
  let query = '?';
  
  if (searchTerm) {
    query += `search=${searchTerm}&`;
  }

  if (productCategory) {
    query += `category=${productCategory}&`;
  }
  
  if (filterQuery) {
    query += filterQuery;
  }
  
  try {
    const response = await axios.get<{ products: Product[] | [] }>(
      `${baseUrl}${query}`
    );
    return response.data.products;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while getting products');
    }
  }
};

const getOne = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get<{ product: Product }>(
      `${baseUrl}/${id}?withReviews=true`
    );
    return response.data.product;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while getting product');
    }
  }
};

const addNew = async (product: NewProduct, accessToken?: string) => {
  if (!isString(accessToken) || accessToken.length === 0) {
    throw new Error('Access token missing or invalid');
  }

  // Add product specs to array to comply with backend type
  const newProduct = {
    ...product,
    specs: [product.specs]
  };

  try {
    const response = await axios.post<{ addedProduct: Product }>(
      baseUrl,
      newProduct,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data.addedProduct;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while adding product');
    }
  }
};

const editOne = async (product: Product, accessToken?: string) => {
  if (!isString(accessToken) || accessToken.length === 0) {
    throw new Error('Access token missing or invalid');
  }

  try {
    const response = await axios.put<{ saveResult: Product }>(
      `${baseUrl}/${product.id}`,
      product,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while adding product');
    }
  }
};

const deleteOne = async (id: string, accessToken?: string) => {
  if (!isString(accessToken) || accessToken.length === 0) {
    throw new Error('Access token missing or invalid');
  }

  try {
    const response = await axios.delete(`${baseUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.status !== 204) {
      console.error(
        `Got response code ${response.status} while deleting product`
      );
    }
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while deleting product');
    }
  }
};

export default { getAll, getOne, addNew, editOne, deleteOne };

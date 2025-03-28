import { backendAddress } from '#src/utils/config';
import axios from 'axios';

import {
  LoginPayload,
  NewOrder,
  OrderInDb,
  OrderFromBackend
} from '#src/types/types.ts';
import { isString, isApiErrorResponse } from '#src/utils/typeNarrowers';

const baseUrl = process.env.NODE_ENV === 'production' ? '/api/orders' : `${backendAddress}/api/orders`;

const getAll = async (
  loggedOnUser?: LoginPayload
): Promise<OrderFromBackend[] | []> => {
  if (!loggedOnUser?.isadmin) {
    throw new Error('Only admin users can get orders');
  }

  try {
    const response = await axios.get<{ orders: OrderFromBackend[] }>(baseUrl, {
      headers: {
        Authorization: `Bearer ${loggedOnUser.accessToken}`
      }
    });

    return response.data.orders;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while getting orders');
    }
  }
};

const postNew = async (
  orderData: NewOrder,
  accessToken: string
): Promise<OrderInDb> => {
  if (!isString(accessToken) || accessToken.length === 0) {
    throw new Error('Access token missing or invalid');
  }

  try {
    const response = await axios.post<{ orderInDb: OrderInDb }>(
      baseUrl,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data.orderInDb;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while sending order');
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
        `Got response code ${response.status} while deleting order`
      );
    }
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while deleting order');
    }
  }
};

export default { postNew, getAll, deleteOne };

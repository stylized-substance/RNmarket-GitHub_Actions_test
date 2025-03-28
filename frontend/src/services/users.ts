import { backendAddress } from '#src/utils/config';
import axios from 'axios';
import { NewUser, UserFromBackend, LoginPayload } from '#src/types/types.ts';
import { isApiErrorResponse, isString } from '#src/utils/typeNarrowers';

const baseUrl = process.env.NODE_ENV === 'production' ? '/api/users' : `${backendAddress}/api/users`;

const getAll = async (
  loggedOnUser?: LoginPayload
): Promise<UserFromBackend[]> => {
  if (!loggedOnUser?.isadmin) {
    throw new Error('Only admin users can get users');
  }

  try {
    const response = await axios.get<{ users: UserFromBackend[] }>(baseUrl, {
      headers: {
        Authorization: `Bearer ${loggedOnUser.accessToken}`
      }
    });

    return response.data.users;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while getting users');
    }
  }
};

const register = async (userData: NewUser): Promise<void> => {
  try {
    await axios.post<{ addedUser: NewUser }>(`${baseUrl}`, userData);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while registering user');
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
      console.error(`Got response code ${response.status} while deleting user`);
    }
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && isApiErrorResponse(error.response?.data)) {
      throw new Error(error.response.data.Error);
    } else {
      throw new Error('Unknown error happened while deleting user');
    }
  }
};

export default { getAll, register, deleteOne };

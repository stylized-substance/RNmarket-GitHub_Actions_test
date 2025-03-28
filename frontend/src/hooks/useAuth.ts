import { LoginCredentials, LoginPayload } from '#src/types/types';
import { isLoginPayload } from '#src/utils/typeNarrowers';
import { useMutation } from '@tanstack/react-query';
import authorizationService from '#src/services/authorization';
import { useToast } from '#src/context/ToastContext';

const useAuth = () => {
  const { changeToast } = useToast();

  // Read logged on user data from localStorage
  const readUserFromLocalStorage = (): LoginPayload | undefined => {
    const userInStorage = localStorage.getItem('loggedOnUser');
    if (!userInStorage) {
      return undefined;
    }

    try {
      const userObject: unknown = JSON.parse(userInStorage);

      if (isLoginPayload(userObject)) {
        return userObject;
      } else {
        throw new Error('Malformed user object found in localStorage');
      }
    } catch {
      return undefined;
    }
  };

  const loggedOnUser = readUserFromLocalStorage();

  // Login using Tanstack Query and save user data to query cache and localStorage
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return authorizationService.login(credentials);
    },
    onSuccess: (data) => {
      if (data) {
        localStorage.setItem('loggedOnUser', JSON.stringify(data));
        changeToast({
          message: 'Logged in succesfully',
          show: true
        });
      }
    },
    onError: (error) => {
      changeToast({
        message: error.message,
        show: true
      });
    }
  });

  // Use logged on user's refresh token to get new access token and save it to query cache and localStorage
  const refreshAccessToken = useMutation({
    mutationFn: async (loggedOnUser: LoginPayload) => {
      const newAccessToken: string =
        await authorizationService.refreshAccessToken(loggedOnUser);
      return { newAccessToken, loggedOnUser };
    },
    onSuccess: ({ newAccessToken, loggedOnUser }) => {
      loggedOnUser.accessToken = newAccessToken;
      localStorage.setItem('loggedOnUser', JSON.stringify(loggedOnUser));
    },
    onError: (error) => {
      logout();
      throw new Error(`Error while refreshing token ${error.message}`);
    }
  });

  // Log out user
  const logout = () => {
    localStorage.removeItem('loggedOnUser');
    changeToast({
      message: 'Logged out',
      show: true
    });
  };

  return {
    loggedOnUser,
    login,
    refreshAccessToken,
    logout
  };
};

export default useAuth;

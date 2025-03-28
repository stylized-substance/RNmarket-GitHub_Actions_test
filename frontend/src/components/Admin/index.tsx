import useAuth from '#src/hooks/useAuth.ts';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '#src/context/ToastContext';

import productsService from '#src/services/products';
import usersService from '#src/services/users';
import ordersService from '#src/services/orders';

import orderBy from 'lodash/orderBy';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import OrderCards from '#src/components/Admin/OrderCards';
import ProductCards from '#src/components/Admin/ProductCards';
import UserCards from '#src/components/Admin/UserCards';
import DeleteModal from '#src/components/Admin/DeleteModal';
import ProductAddForm from '#src/components/Admin/ProductAddForm';

import { ItemToDelete } from '#src/types/types';

const Admin = () => {
  const { changeToast } = useToast();
  const { loggedOnUser, refreshAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemtoDelete] = useState<ItemToDelete | null>(null);
  const [showProductAddForm, setShowProductAddForm] = useState<boolean>(false);

  // Fetch products, users and orders with Tanstack Query
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await productsService.getAll({});

      // Sort by title
      const lowerCased = products.map((product) => ({
        ...product,
        lowerCaseTitle: product.title.toLowerCase()
      }));

      const sorted = orderBy(lowerCased, ['lowerCaseTitle'], ['asc']);

      // Discard lowercase titles
      const lowerCaseDiscarded = sorted.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ lowerCaseTitle, ...rest }) => rest
      );

      return lowerCaseDiscarded;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!loggedOnUser?.isadmin) {
        return;
      }

      try {
        const users = await usersService.getAll(loggedOnUser);

        // Sort by username
        const lowerCased = users.map((user) => ({
          ...user,
          lowerCaseUsername: user.username.toLowerCase()
        }));

        const sorted = orderBy(lowerCased, ['lowerCaseUsername'], ['asc']);

        // Discard lowercase user names
        const lowerCaseDiscarded = sorted.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ lowerCaseUsername, ...rest }) => rest
        );

        return lowerCaseDiscarded;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'jwt expired') {
            const refreshResult =
              await refreshAccessToken.mutateAsync(loggedOnUser);
            return await usersService.getAll(refreshResult?.loggedOnUser);
          } else {
            throw new Error(error.message);
          }
        }
      }
    },
    enabled: loggedOnUser?.isadmin // Don't run query if admin user isn't logged in
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!loggedOnUser?.isadmin) {
        return;
      }

      try {
        const orders = await ordersService.getAll(loggedOnUser);
        return orderBy(orders, ['createdAt'], ['desc']);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'jwt expired') {
            const refreshResult =
              await refreshAccessToken.mutateAsync(loggedOnUser);
            return await ordersService.getAll(refreshResult?.loggedOnUser);
          } else {
            throw error;
          }
        }
      }
    },
    enabled: loggedOnUser?.isadmin // Don't run query if admin user isn't logged in
  });

  const deleteMutation = useMutation({
    // Delete item from backend
    mutationFn: async ({ type, id }: ItemToDelete) => {
      let deleteFunction;

      try {
        switch (type) {
          case 'products':
            deleteFunction = productsService.deleteOne;
            return await productsService.deleteOne(
              id,
              loggedOnUser?.accessToken
            );
          case 'users':
            deleteFunction = usersService.deleteOne;
            return await usersService.deleteOne(id, loggedOnUser?.accessToken);
          case 'orders':
            deleteFunction = ordersService.deleteOne;
            return await ordersService.deleteOne(id, loggedOnUser?.accessToken);
          default: {
            const _exhaustiveCheck: never = type;
            return _exhaustiveCheck;
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (
            error.message === 'jwt expired' &&
            loggedOnUser &&
            deleteFunction
          ) {
            // Refresh expired access token and retry deleting product
            const { newAccessToken } =
              await refreshAccessToken.mutateAsync(loggedOnUser);
            return await deleteFunction(id, newAccessToken);
          } else {
            throw error;
          }
        }
      }
    },
    onSuccess: async (_result, { type }) => {
      await queryClient.invalidateQueries({
        queryKey: [`${type}`]
      });
      changeToast({ message: `${type} deleted`, show: true });
    },
    onError: (error) => changeToast({ message: error.message, show: true })
  });

  const prepareForDelete = (item: ItemToDelete) => {
    setItemtoDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setShowDeleteModal(false);
      deleteMutation.mutate(itemToDelete);
    }
  };

  if (!loggedOnUser?.isadmin) {
    return <h1 className="text-center mt-5">Admin not logged in</h1>;
  }

  return (
    <>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDelete={handleDelete}
      />
      <Row className="mt-4">
        <h1 className="text-center mt-4 mb-4">Admin page</h1>
      </Row>
      <Row className="mt-4">
        {showProductAddForm ? (
          <Col lg={4}>
            <ProductAddForm setShowProductAddForm={setShowProductAddForm} />
          </Col>
        ) : (
          <Col lg={4}>
            <Button
              className="custom-button"
              size="lg"
              onClick={() => setShowProductAddForm(true)}
            >
              Add new product
            </Button>
          </Col>
        )}
      </Row>
      <Row className="mt-4">
        <Col lg={4}>
          <ProductCards
            products={products}
            prepareForDelete={prepareForDelete}
          />
        </Col>
        <Col lg={4}>
          <UserCards users={users} prepareForDelete={prepareForDelete} />
        </Col>
        <Col lg={4}>
          <OrderCards orders={orders} prepareForDelete={prepareForDelete} />
        </Col>
      </Row>
    </>
  );
};

export default Admin;

import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '#src/hooks/useAuth.ts';
import { useToast } from '#src/context/ToastContext.tsx';

import productsService from '#src/services/products';

import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { Formik } from 'formik';
import * as yup from 'yup';

import { Product, EditedProduct } from '#src/types/types.ts';

const ProductEditForm = ({
  product,
  setIsEditing
}: {
  product: Product;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { changeToast } = useToast();
  const { loggedOnUser, refreshAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const productEditMutation = useMutation({
    // Edit product in backend
    mutationFn: async (editedProduct: EditedProduct) => {
      if (!loggedOnUser?.accessToken) {
        throw new Error('Access token missing');
      }

      const productForBackend = {
        ...product,
        ...editedProduct
      };

      try {
        return await productsService.editOne(
          productForBackend,
          loggedOnUser.accessToken
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'jwt expired' && loggedOnUser) {
            // Refresh expired access token and retry posting order
            const { newAccessToken } =
              await refreshAccessToken.mutateAsync(loggedOnUser);
            return await productsService.editOne(
              productForBackend,
              newAccessToken
            );
          } else {
            throw error;
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['products']
      });
      changeToast({
        message: 'Product updated',
        show: true
      });
    },
    onError: (error) => {
      changeToast({
        message: error.message,
        show: true
      });
    }
  });

  const handleSubmit = (formValues: EditedProduct) => {
    setIsEditing(false)
    productEditMutation.mutate(formValues);
  };

  const formSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    price: yup
      .number()
      .typeError('Price must be a number')
      .required('Price is required'),
    instock: yup
      .number()
      .typeError('In stock be a number')
      .required('In stock is required')
  });

  return (
    <Formik<EditedProduct>
      validationSchema={formSchema}
      onSubmit={(values) => handleSubmit(values)}
      initialValues={{
        title: product.title,
        price: product.price,
        instock: product.instock
      }}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  isInvalid={touched.title && !!errors.title}
                  className="mb-3"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  isInvalid={touched.price && !!errors.price}
                  className="mb-3"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <Form.Label>Amount in stock</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="instock"
                  value={values.instock}
                  onChange={handleChange}
                  isInvalid={touched.instock && !!errors.instock}
                  className="mb-3"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.instock}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Row>
          <Row className="gap-3 ms-1 mb-4">
            <Button type="submit" className="custom-button mt-4 w-auto">
              Update
            </Button>
            <Button
              className="custom-button mt-4 w-auto"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default ProductEditForm;

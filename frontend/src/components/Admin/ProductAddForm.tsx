import { useMutation } from '@tanstack/react-query';
import useAuth from '#src/hooks/useAuth.ts';
import { useToast } from '#src/context/ToastContext.tsx';

import productsService from '#src/services/products';

import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { Formik } from 'formik';
import * as yup from 'yup';

import { NewProduct } from '#src/types/types.ts';

const ProductAddForm = ({
  setShowProductAddForm
}: {
  setShowProductAddForm: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { changeToast } = useToast();
  const { loggedOnUser, refreshAccessToken } = useAuth();

  const productAddMutation = useMutation({
    // Send product to backend
    mutationFn: async (newProduct: NewProduct) => {
      if (!loggedOnUser?.accessToken) {
        throw new Error('Access token missing');
      }

      try {
        return await productsService.addNew(
          newProduct,
          loggedOnUser.accessToken
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message === 'jwt expired' && loggedOnUser) {
            // Refresh expired access token and retry posting order
            const { newAccessToken } =
              await refreshAccessToken.mutateAsync(loggedOnUser);
            return await productsService.addNew(newProduct, newAccessToken);
          } else {
            throw error;
          }
        }
      }
    },
    onSuccess: (addedProduct) => {
      changeToast({
        message: `Added new product: '${addedProduct?.title}'`,
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

  const handleSubmit = (formValues: NewProduct) => {
    productAddMutation.mutate(formValues);
  };

  const formSchema = yup.object().shape({
    category: yup
      .string()
      .required('Category is required')
      .oneOf(['Mobiles', 'Furniture', 'Laptops']),
    title: yup.string().required('Title is required'),
    specs: yup.string().required('Specs are required'),
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
    <Formik<NewProduct>
      validationSchema={formSchema}
      onSubmit={(values) => handleSubmit(values)}
      initialValues={{
        category: 'Mobiles',
        title: '',
        specs: '',
        price: 0,
        instock: 0
      }}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <InputGroup>
                <Form.Select
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  isInvalid={touched.category && !!errors.category}
                  className="mb-3"
                >
                  <option>Mobiles</option>
                  <option>Furniture</option>
                  <option>Laptops</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Row>
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
              <Form.Label>Specs</Form.Label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="specs"
                  value={values.specs}
                  onChange={handleChange}
                  isInvalid={touched.specs && !!errors.specs}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.specs}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
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
              Add product
            </Button>
            <Button
              className="custom-button mt-4 w-auto"
              onClick={() => setShowProductAddForm(false)}
            >
              Cancel
            </Button>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default ProductAddForm;

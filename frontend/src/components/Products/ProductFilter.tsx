import { useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '#src/context/ProductContext.tsx';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Stack from 'react-bootstrap/Stack';

import { Formik } from 'formik';
import * as yup from 'yup';

import { ProductFilterState } from '#src/types/types.ts';

const ProductFilter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productContext = useProducts();

  const handleSubmit = (formValues: ProductFilterState) => {
    // Construct URL query string from form values
    const query = `?${Object.entries(formValues)
      .map((property) => `${property[0]}=${property[1]}`)
      .join('&')}`;

    // Update product filter state
    productContext.dispatch({
      type: 'filtered',
      payload: {
        filter: formValues
      }
    });

    navigate(`${location.pathname}${query}`);
  };

  const formSchema = yup.object().shape({
    lowestPrice: yup
      .number()
      .required()
      .min(0, 'Must be 0 or higher')
      .max(10000, 'Must be 10000 or lower'),
    highestPrice: yup
      .number()
      .required()
      .min(0, 'Must be 0 or higher')
      .max(10000, 'Must be 10000 or lower'),
    lowestRating: yup
      .number()
      .required()
      .min(1, 'Must be 1 or higher')
      .max(5, 'Must be 5 or lower'),
    highestRating: yup
      .number()
      .required()
      .min(1, 'Must be 1 or higher')
      .max(5, 'Must be 5 or lower'),
    instock: yup.boolean().required()
  });

  return (
    <>
      <h4>Filter products</h4>
      <Formik<ProductFilterState>
        validationSchema={formSchema}
        onSubmit={(values) => handleSubmit(values)}
        initialValues={productContext.state.filter}
        enableReinitialize
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          touched,
          errors
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Stack gap={3}>
              <Form.Group>
                <Form.Label>
                  <b>Lowest price</b>
                </Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    name="lowestPrice"
                    value={values.lowestPrice}
                    onChange={handleChange}
                    isInvalid={touched.lowestPrice && !!errors.lowestPrice}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.lowestPrice}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  <b>Highest price</b>
                </Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    name="highestPrice"
                    value={values.highestPrice}
                    onChange={handleChange}
                    isInvalid={touched.highestPrice && !!errors.highestPrice}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.highestPrice}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  <b>Lowest rating</b>
                </Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    name="lowestRating"
                    value={values.lowestRating}
                    onChange={handleChange}
                    isInvalid={touched.lowestRating && !!errors.lowestRating}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.lowestRating}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  <b>Highest rating</b>
                </Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    name="highestRating"
                    value={values.highestRating}
                    onChange={handleChange}
                    isInvalid={touched.highestRating && !!errors.highestRating}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.highestRating}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label></Form.Label>
                <b>In stock items only</b>
                <InputGroup>
                  <Form.Check
                    type="switch"
                    name="instock"
                    id="instock-switch"
                    checked={values.instock}
                    onChange={() => {
                      void setFieldValue('instock', !values.instock);
                    }}
                  />
                </InputGroup>
              </Form.Group>
              <Button type="submit" className="custom-button">
                Submit
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ProductFilter;

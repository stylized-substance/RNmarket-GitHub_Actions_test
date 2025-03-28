import { useMutation } from '@tanstack/react-query';
import { useToast } from '#src/context/ToastContext';
import { Formik } from 'formik';
import * as yup from 'yup';
import usersService from '#src/services/users';

import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { NewUser } from '#src/types/types';

interface RegisterMenuProps {
  setLoginDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegisterMenu = ({ setLoginDropdownOpen }: RegisterMenuProps) => {
  const { changeToast } = useToast();

  // Register a new user account
  const register = useMutation({
    mutationFn: (userData: NewUser) => {
      return usersService.register(userData);
    },
    onSuccess: () => {
      setLoginDropdownOpen(false);
      changeToast({
        message: 'New user created. You can now log in',
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

  const handleRegister = (userData: NewUser) => {
    register.mutate(userData);
  };

  const formSchema = yup.object().shape({
    username: yup
      .string()
      .email('Enter a valid email address')
      .required('Enter a valid email address'),
    name: yup.string().required(),
    password: yup.string().required(),
    isadmin: yup.boolean().required()
  });

  return (
    <>
      <Formik
        validationSchema={formSchema}
        onSubmit={(values) => handleRegister(values)}
        initialValues={{
          username: '',
          name: '',
          password: '',
          isadmin: false
        }}
      >
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className="d-flex flex-column ps-3 pe-3 mt-3"
            style={{
              width: '30vh'
            }}
          >
            <Form.Group controlId="registerform">
              <Form.Label>Username</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type="email"
                  placeholder="Enter username (must be an email address)"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  isInvalid={touched.username && !!errors.username}
                  className="navbar-loginform-form-control"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Label className="mt-3">Full name</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={touched.username && !!errors.name}
                  className="navbar-loginform-form-control"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Label className="mt-3">Password</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type="password"
                  placeholder="Enter a password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && !!errors.password}
                  className="navbar-loginform-form-control"
                ></Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Button type="submit" className="custom-button mt-4 mb-2">
              Send
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RegisterMenu;

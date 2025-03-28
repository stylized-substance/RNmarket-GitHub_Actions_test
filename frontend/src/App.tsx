import '#src/styles/custom.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useAuth from '#src/hooks/useAuth';
import { useToast } from '#src/context/ToastContext';

import Home from '#src/components/Home';
import NavBar from '#src/components/Navbar/index.tsx';
import Products from '#src/components/Products/index.tsx';
import SingleProduct from '#src/components/Products/SingleProduct.tsx';
import Cart from '#src/components/Cart/index.tsx';
import Checkout from '#src/components/Checkout';
import Admin from '#src/components/Admin/index.tsx';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';

const App = () => {
  // Read logged on user data from localStorage
  const { loggedOnUser } = useAuth();

  // Import toast notification state
  const { toastState } = useToast();

  return (
    <>
      <Container
        fluid
        id="app-container"
        className="d-flex flex-column min-vh-100"
      >
        <Row id="toast-row" className="justify-content-center">
          <Toast
            show={toastState.show}
            animation={true}
            bg="dark"
            className="toast-notification text-center"
          >
            <Toast.Body className="toast-notification-body">
              {toastState.message}
            </Toast.Body>
          </Toast>
        </Row>
        <BrowserRouter>
          <Row id="navbar-row">
            <NavBar loggedOnUser={loggedOnUser} />
          </Row>
          <Row id="content-row" className="ms-4 me-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/products"
                element={<Products productCategory="All products" />}
              />
              <Route
                path="/products/mobiles"
                element={<Products productCategory="Mobiles" />}
              />
              <Route
                path="/products/furniture"
                element={<Products productCategory="Furniture" />}
              />
              <Route
                path="/products/laptops"
                element={<Products productCategory="Laptops" />}
              />
              <Route path="/products/:id" element={<SingleProduct />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </Row>
        </BrowserRouter>
        <footer
          style={{
            backgroundColor: 'black',
            color: 'white',
            position: 'fixed',
            width: '100%',
            left: 0,
            right: 0,
            bottom: 0
          }}
          className="p-2 text-center"
        >
          © 2025 RNMarket
        </footer>
      </Container>
    </>
  );
};

export default App;

import { useCart } from '#src/context/CartContext.tsx';
import { useNavigate } from 'react-router-dom';
import { cartTotalPrice } from '#src/utils/cartTotalPrice';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import CartProducts from '#src/components/Cart/CartProducts';

const Cart = () => {
  // Import cart context
  const cart = useCart();
  const navigate = useNavigate();
  const cartItems = cart.state;

  return (
    <>
      <Row className="justify-content-center mt-5 mb-5">
        <Col>
          <h1 className="text-center">Shopping cart</h1>
        </Col>
      </Row>
      <Row className="align-items-start mt-5">
        {cartItems.length > 0 ? (
          <Col>
            <Stack gap={5} className="me-auto">
              <CartProducts />
            </Stack>
          </Col>
        ) : (
          <Col md={{ offset: 2 }} className="text-center">
            <h3>Cart is empty</h3>
          </Col>
        )}
        <Col className="bg-light" lg={2}>
          <Stack className="p-4" gap={2}>
            <h5 className="text-center">Total price:</h5>
            <h5 className="text-center">{cartTotalPrice(cartItems)}€</h5>
            <Button
              onClick={() => {
                navigate('/checkout');
              }}
              className="custom-button fs-5"
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </Stack>
        </Col>
      </Row>
    </>
  );
};

export default Cart;

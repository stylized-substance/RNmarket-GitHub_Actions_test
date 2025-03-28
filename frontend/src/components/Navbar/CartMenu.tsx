import { useCart } from '#src/context/CartContext.tsx';
import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import { CartItem } from '#src/types/types.ts';

const CartMenu = () => {
  const cart = useCart();
  const cartItems = cart.state;

  const navigate = useNavigate();

  const handleIncrease = (item: CartItem) => {
    cart.dispatch({
      type: 'modified',
      payload: { product: item.product, quantity: item.quantity + 1 }
    });
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity - 1 < 1) {
      return;
    }

    cart.dispatch({
      type: 'modified',
      payload: { product: item.product, quantity: item.quantity - 1 }
    });
  };

  const handleRemove = (item: CartItem) => {
    cart.dispatch({
      type: 'removed',
      payload: item
    });
  };

  return (
    <Col
      className="mt-2 d-flex flex-column overflow-x-hidden overflow-y-scroll"
      style={{
        height: '50vh',
        width: '40vh',
        scrollbarWidth: 'thin'
      }}
    >
      <Stack
        direction="horizontal"
        gap={5}
        id="top-buttons-stack"
        className="justify-content-center mb-3"
      >
        <Button
          onClick={() => navigate('/cart')}
          className="custom-button mb-2 w-25"
        >
          Go to cart
        </Button>
        <Button
          onClick={() => navigate('/checkout')}
          className="custom-button mb-2 w-25"
          disabled={cartItems.length === 0}
        >
          Checkout
        </Button>
      </Stack>
      {cartItems.length === 0 ? (
        <Row className="text-center mt-4">
          <h4>Cart is empty</h4>
        </Row>
      ) : (
        <Stack gap={3} style={{}}>
          {cartItems.map((item) => (
            <Row
              key={item.product.id}
              style={{}}
              className="border-bottom ms-1 me-1"
            >
              <Col id="cart-product-image-column" className="pb-3" style={{}}>
                {item.product.imgs && (
                  <Image
                    src={item.product.imgs[0]}
                    style={{
                      width: '100%',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </Col>
              <Col id="title-column">
                <Link
                  to={`/products/${item.product.id}`}
                  className="text-light text-wrap"
                >
                  <div>{item.product.title.substring(0, 40)}...</div>
                </Link>
                <div className="text-danger">{item.product.price}€</div>
              </Col>
              <Col id="stack-column" className="">
                <Stack direction="horizontal" gap={2}>
                  <Button
                    style={{ background: 'black' }}
                    onClick={() => handleDecrease(item)}
                    disabled={item.product.instock === 0}
                    className="border"
                  >
                    -
                  </Button>
                  <Badge
                    bg="light"
                    text="dark"
                    style={{ width: '2em' }}
                    className="d-flex justify-content-center fs-6 border"
                  >
                    {item.quantity}
                  </Badge>
                  <Button
                    style={{ background: 'black' }}
                    onClick={() => handleIncrease(item)}
                    disabled={item.product.instock === 0}
                    className="border"
                  >
                    +
                  </Button>
                  <Button
                    style={{ background: 'firebrick' }}
                    onClick={() => handleRemove(item)}
                    className="border"
                  >
                    <i className="bi bi-trash3"></i>
                  </Button>
                </Stack>
              </Col>
            </Row>
          ))}
        </Stack>
      )}
    </Col>
  );
};

export default CartMenu;

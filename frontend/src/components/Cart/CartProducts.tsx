import { useCart } from '#src/context/CartContext.tsx';

import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import { CartItem } from '#src/types/types.ts';

const CartProducts = () => {
  const cart = useCart();
  const cartItems = cart.state;

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
    <>
      {cartItems.map((item) => (
        <Row
          key={item.product.id}
          style={{ height: '15vh' }}
          className="gap-5 "
        >
          <Col
            id="cart-product-image"
            style={{ height: '100%' }}
            className="flex-shrink-0"
          >
            {item.product.imgs && (
              <Image
                src={item.product.imgs[0]}
                thumbnail
                style={{ height: '100%' }}
                className="object-fit-contain"
              />
            )}
          </Col>
          <Col>
            <Stack gap={2}>
              <Link to={`/products/${item.product.id}`}>
                <b>{item.product.title}</b>
              </Link>
              <i>{item.product.price}€</i>
              {item.product.instock > 0 ? (
                <p>In stock: {item.product.instock}</p>
              ) : (
                <p style={{ color: 'red' }}>Product out of stock</p>
              )}
            </Stack>
          </Col>
          <Col>
            <Stack direction="horizontal" gap={3}>
              <Button
                style={{ background: 'black' }}
                onClick={() => handleDecrease(item)}
                disabled={item.product.instock === 0}
              >
                -
              </Button>
              <Badge bg="light" text="dark" className="fs-6">
                {item.quantity}
              </Badge>
              <Button
                style={{ background: 'black' }}
                onClick={() => handleIncrease(item)}
                disabled={item.product.instock === 0}
              >
                +
              </Button>
              <Button
                style={{ background: 'firebrick' }}
                onClick={() => handleRemove(item)}
              >
                <i className="bi bi-trash3"></i>
              </Button>
            </Stack>
          </Col>
        </Row>
      ))}
    </>
  );
};

export default CartProducts;

import { backendAddress } from '#src/utils/config.ts';
import { padPrice } from '#src/utils/padPrice.ts';

import { useCart } from '#src/context/CartContext.tsx';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';

import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import { Product } from '#src/types/types';

interface ProductCardsProps {
  products: Product[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = (props: ProductCardProps) => {
  const cart = useCart();

  let imageUrl = '';
  if (props.product.imgs !== null && props.product.imgs !== undefined) {
    imageUrl =
      process.env.NODE_ENV === 'production'
        ? `${props.product.imgs[0]}`
        : `${backendAddress}${props.product.imgs[0]}`;
  }

  return (
    <Card
      id="product-card-container"
      className="border-0 mb-5 justify-content-between"
    >
      <Link
        to={`/products/${props.product.id}`}
        key={props.product.id}
        id="image-link"
      >
        <Card.Img
          variant="top"
          src={imageUrl}
          style={{
            aspectRatio: '1 / 1',
            objectFit: 'contain'
          }}
        />
      </Link>
      <Link
        to={`/products/${props.product.id}`}
        key={props.product.id + 1}
        id="title-link"
      >
        <Card.Body>
          <Card.Title className="text-truncate text-wrap">
            {props.product.title}
          </Card.Title>
          <Card.Subtitle className="fs-5 mt-2 text-danger">
            {padPrice(props.product.price)}€
          </Card.Subtitle>
        </Card.Body>
      </Link>
      <Button
        disabled={props.product.instock === 0}
        size="lg"
        onClick={() =>
          cart.dispatch({
            type: 'added',
            payload: { product: props.product, quantity: 1 }
          })
        }
        className="custom-button align-self-center"
      >
        Add to cart
      </Button>
    </Card>
  );
};

const ProductCards = (props: ProductCardsProps) => {
  return (
    <Row lg={4}>
      {props.products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </Row>
  );
};

export default ProductCards;

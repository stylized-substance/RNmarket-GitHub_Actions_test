import { backendAddress } from '#src/utils/config';
import productsService from '#src/services/products';
import { padPrice } from '#src/utils/padPrice.ts';
import { parseString } from '#src/utils/typeNarrowers';

import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '#src/context/CartContext.tsx';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import BreadCrumb from 'react-bootstrap/Breadcrumb';
import ProductsPending from '#src/components/Products/ProductsPending.tsx';
import ProductsError from '#src/components/Products/ProductsError.tsx';
import StarRating from '#src/components/StarRating';
import Reviews from '#src/components/Reviews';
import ReviewForm from '#src/components/ReviewForm';

const ImageCarousel = ({ images }: { images: string[] }) => {
  const imageUrls: string[] = images.map((image) => {
    return process.env.NODE_ENV === 'production'
      ? image
      : `${backendAddress}${image}`;
  });

  return (
    <Carousel
      id="image-carousel"
      interval={null}
      data-bs-theme="dark"
      className="d-flex align-items-center justify-content-center h-auto w-auto mt-5"
    >
      {imageUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <div className="d-flex justify-content-center">
            <img src={imageUrl} />
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

const SingleProduct = () => {
  const navigate = useNavigate();
  const cart = useCart();

  // Read product id from current URI and parse it
  let { id } = useParams();
  id = parseString(id);

  // Fetch product with Tanstack Query
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['singleProduct'],
    queryFn: () => {
      if (!id) {
        throw new Error('Product Id missing from URI');
      }

      return productsService.getOne(id);
    }
  });

  if (isPending) {
    return <ProductsPending />;
  }

  if (isError) {
    return <ProductsError error={error} />;
  }

  if (!data) {
    return <h1 className="text-center">Product not found</h1>;
  }

  return (
    <>
      <Row>
        <BreadCrumb className="fs-5 ms-5 mt-5">
          <BreadCrumb.Item onClick={() => navigate('/')}>Home</BreadCrumb.Item>
          <BreadCrumb.Item onClick={() => navigate('/products')}>
            Products
          </BreadCrumb.Item>
          <BreadCrumb.Item
            onClick={() => navigate(`/products/${data.category}`)}
          >
            {data.category}
          </BreadCrumb.Item>
        </BreadCrumb>
      </Row>
      <Row className="justify-content-between">
        <Col lg={4}>{data.imgs && <ImageCarousel images={data.imgs} />}</Col>
        <Col id="product-info" lg={6} className="d-flex flex-column mt-5 ">
          <h1 className="w-75">{data.title}</h1>
          <p style={{ color: 'coral' }} className="fs-1">
            {padPrice(data.price)}€
          </p>
          {data.rating && (
            <Row className="mb-4">
              <StarRating rating={data.rating} />
            </Row>
          )}
          <Col className="mb-4">
            {data.specs.map((spec, index) => (
              <p key={index}>{spec}</p>
            ))}
          </Col>
          <Button
            disabled={data.instock === 0}
            size="lg"
            onClick={() =>
              cart.dispatch({
                type: 'added',
                payload: { product: data, quantity: 1 }
              })
            }
            className="custom-button w-25"
          >
            Add to cart
          </Button>
          {data.instock === 0 && (
            <b className="mt-4 fs-4" style={{ color: 'red' }}>
              {' '}
              Product out of stock
            </b>
          )}
        </Col>
      </Row>
      <Row className="mt-5">
        <Reviews productId={id} />
        <ReviewForm productId={id} />
      </Row>
    </>
  );
};

export default SingleProduct;

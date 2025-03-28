import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Col className="d-flex flex-column justify-content-center mt-5">
      <h1 className="text-center pb-5">Hello, select a product category</h1>
      <Stack direction="horizontal" gap={3} className="justify-content-center">
        <Link to={'/products/mobiles'}>
          <Button className="custom-button" size="lg">
            Mobile phones
          </Button>
        </Link>
        <Link to={'/products/furniture'}>
          <Button className="custom-button" size="lg">
            Furniture
          </Button>
        </Link>
        <Link to={'products/laptops'}>
          <Button className="custom-button" size="lg">
            Laptops
          </Button>
        </Link>
      </Stack>
    </Col>
  );
};

export default Home;

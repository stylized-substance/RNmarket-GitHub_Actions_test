import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

const ProductsPending = () => {
  return (
    <Row>
      <Col className="d-flex justify-content-center mt-4">
        <Spinner animation="grow" role="status" />
      </Col>
    </Row>
  );
};

export default ProductsPending;

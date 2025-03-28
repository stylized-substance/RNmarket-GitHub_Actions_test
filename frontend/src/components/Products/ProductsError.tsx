import Row from 'react-bootstrap/Row';

interface ProductsErrorProps {
  error: Error;
}

const ProductsError = ({ error }: ProductsErrorProps) => {
  console.error('Error from ProductsError component:', error.message);

  return (
    <Row>
      <h4>An error happened while getting products</h4>
    </Row>
  );
};

export default ProductsError;

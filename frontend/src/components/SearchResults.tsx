import { useParams } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const SearchResults = () => {
  const { searchTerm } = useParams();

  return (
    <Row>
      <Col>
        <h1 className="text-center m-4">Search results for: {searchTerm}</h1>
      </Col>
    </Row>
  );
};

export default SearchResults;

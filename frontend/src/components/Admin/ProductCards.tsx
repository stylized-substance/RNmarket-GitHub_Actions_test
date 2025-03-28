import { useState } from 'react';

import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import ProductEditForm from '#src/components/Admin/ProductEditForm';

import { Product, ItemToDelete } from '#src/types/types.ts';

const ProductAccordion = ({
  product,
  prepareForDelete
}: {
  product: Product;
  prepareForDelete: (item: ItemToDelete) => void;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <>
      {isEditing ? (
        <ProductEditForm product={product} setIsEditing={setIsEditing} />
      ) : (
        <Accordion>
          <Accordion.Item key={product.id} eventKey={product.id}>
            <Accordion.Header>{product.title}</Accordion.Header>
            <Accordion.Body>
              <dl>
                <dt>Id</dt>
                <dd>{product.id}</dd>
                <dt>Category</dt>
                <dd>{product.category}</dd>
                <dt>Price</dt>
                <dd>{product.price}</dd>
                <dt>Amount of product in stock</dt>
                <dd>{product.instock}</dd>
                <dt>Created at</dt>
                <dd>{product.createdAt}</dd>
                <dt>Updated at</dt>
                <dd>{product.updatedAt}</dd>
              </dl>
              <Row className="gap-3">
                <Button
                  style={{ background: 'firebrick' }}
                  onClick={() =>
                    prepareForDelete({ type: 'products', id: product.id })
                  }
                  className="d-flex gap-2 w-auto"
                >
                  <div>Delete</div>
                  <i className="bi bi-trash3"></i>
                </Button>
                <Button
                  className="custom-button w-auto"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </>
  );
};

const ProductCards = ({
  products,
  prepareForDelete
}: {
  products: Product[] | undefined;
  prepareForDelete: (item: ItemToDelete) => void;
}) => {
  return (
    <Card>
      <Card.Header>Products in database</Card.Header>
      <Card.Body>
        {products?.map((product) => (
          <div key={product.id} className="mb-2">
            <ProductAccordion
              product={product}
              prepareForDelete={prepareForDelete}
            />
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default ProductCards;

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useProducts } from '#src/context/ProductContext.tsx';

import productsService from '#src/services/products';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProductCards from '#src/components/Products/ProductCards';
import ProductsPending from '#src/components/Products/ProductsPending';
import ProductsError from '#src/components/Products/ProductsError';
import ProductSortDropdown from '#src/components/Products/ProductSortDropdown';
import ProductFilter from '#src/components/Products/ProductFilter';

import { isProductCategory } from '#src/utils/typeNarrowers';
import { useEffect, useRef } from 'react';
interface ProductsProps {
  productCategory?: string;
}

const Products = (props: ProductsProps) => {
  const productContext = useProducts();
  const dispatchRef = useRef(productContext.dispatch);

  // Parse search term and product filter query from URL
  const [searchTerm] = new URLSearchParams(useLocation().search).getAll(
    'search'
  );
  const urlFilter = useLocation().search.substring(1);

  // Parse current product category
  const productCategory =
    props.productCategory && isProductCategory(props.productCategory)
      ? props.productCategory
      : undefined;

  useEffect(() => {
    // Reset product filter form state when product category or search term changes
    // A ref is used to prevent a render loop while having necessary functions as useEffect dependencies
    dispatchRef.current({ type: 'filterReset' });
  }, [productCategory, searchTerm]);

  // Fetch products with Tanstack Query
  const filterQuery = searchTerm ? undefined : urlFilter;

  // Refetch query when product search term, category or filter query changes
  const { isPending, isError, error } = useQuery({
    queryKey: ['products', searchTerm, productCategory, filterQuery],
    queryFn: async () => {
      const productsFromBackend = await productsService.getAll({
        searchTerm,
        productCategory,
        filterQuery
      });

      if (productsFromBackend.length === 0) {
        throw new Error("No products found")
      }

      productContext.dispatch({
        type: 'added',
        payload: productsFromBackend
      });

      return productsFromBackend;
    },
  });

  return (
    <Col id="products-page">
      <Col className="flex-grow-0 mt-5">
        <Row className="m-4">
          {searchTerm ? (
            <h1 className="text-center">Search results for: {searchTerm}</h1>
          ) : (
            <h1 className="text-center">{props.productCategory === 'Mobiles' ? 'Mobile phones' : props.productCategory}</h1>
          )}
        </Row>
      </Col>
      <Row>
        <Col lg={2}>
          <h5>{productContext.state.products.length} products</h5>
        </Col>
        <Col>
          <ProductSortDropdown />
        </Col>
      </Row>
      <Row>
        <Col lg={2}>
          <ProductFilter />
        </Col>
        <Col lg={10}>
          {isPending && <ProductsPending />}
          {isError && <ProductsError error={error} />}
          {productContext.state.products && (
            <ProductCards products={productContext.state.products} />
          )}
        </Col>
      </Row>
    </Col>
  );
};

export default Products;

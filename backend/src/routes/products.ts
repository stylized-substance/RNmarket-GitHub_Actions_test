import { Request, Response, Router } from 'express';
import { Product as ProductModel } from '#src/models';
import { processProductQueryParameters } from '#src/middleware/productQueryParametersProcessor';
import tokenExtractor from '#src/middleware/tokenExtractor';
import { Product } from '#src/types/types';
import { isProduct, toProduct, parseString } from '#src/utils/typeNarrowers';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Get products
router.get(
  '/',
  processProductQueryParameters,
  async (req: Request, res: Response) => {
    const products: ProductModel[] | [] = await ProductModel.findAll(
      req.searchParameters
    );
    res.json({ products });
  }
);

// Get single product by database primary key
router.get(
  '/:id',
  processProductQueryParameters,
  async (req: Request, res: Response) => {
    const id: string = parseString(req.params.id);
    const product: ProductModel | null = await ProductModel.findByPk(
      id,
      req.searchParameters
    );
    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ Error: 'Product not found' });
    }
  }
);

// Add new product
router.post('/', tokenExtractor, async (req: Request, res: Response) => {
  if (!req.verifiedToken.isadmin) {
    return res.status(400).json({ Error: 'Only admin users can add products' });
  }

  if (!isProduct(req.body)) {
    return res.status(400).json({ Error: 'Invalid product data' })
  }

  const newProduct: Product = {
    ...req.body,
    id: uuidv4()
  }

  const addedProduct: ProductModel = await ProductModel.create({
    ...newProduct
  });

  return res.json({ addedProduct });
});

// Update existing product
router.put('/:id', tokenExtractor, async (req: Request, res: Response) => {
  if (!req.verifiedToken.isadmin) {
    return res
      .status(400)
      .json({ Error: 'Only admin users can update products' });
  }
  const id: string = parseString(req.params.id);
  const product: ProductModel | null = await ProductModel.findByPk(id);
  const updatedProduct: Product = toProduct(req.body);

  if (product) {
    const productWithUpdatedValues: Product = toProduct({
      ...product,
      ...updatedProduct
    });
    await product.update(productWithUpdatedValues);
    const saveResult: ProductModel = await product.save();
    return res.json({ saveResult });
  } else {
    return res.status(404).json({ Error: 'Product not found' });
  }
});

// Delete product
router.delete('/:id', tokenExtractor, async (req: Request, res: Response) => {
  if (!req.verifiedToken.isadmin) {
    return res
      .status(400)
      .json({ Error: 'Only admin users can delete products' });
  }
  const id: string = parseString(req.params.id);
  const product: ProductModel | null = await ProductModel.findByPk(id);

  if (product) {
    await product.destroy();
    return res.status(204).end();
  } else {
    return res.status(404).json({ Error: 'Product not found' });
  }
});

export default router;

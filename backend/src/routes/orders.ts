import { Request, Response, Router } from 'express';
import tokenExtractor from '#src/middleware/tokenExtractor';
import { Order as OrderModel } from '#src/models';
import { Product as ProductModel } from '#src/models';
import { NewOrder, OrderInDb } from '#src/types/types';
import { OrderFromDb } from '#src/types/types';
import { toNewOrder, parseString } from '#src/utils/typeNarrowers';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Get all orders, including their products
router.get('/', tokenExtractor, async (req: Request, res: Response) => {
  if (!req.verifiedToken.isadmin) {
    return res.status(400).json({ Error: 'Only admin users can list orders' });
  }

  // Get orders from db
  const orders: OrderModel[] = await OrderModel.findAll({
    include: [
      {
        model: ProductModel,
        attributes: ['id', 'title', 'price', 'instock'],
        through: {
          attributes: ['quantity'] // Include product quantity from junction table
        }
      }
    ]
  });

  // Convert sequelize order data to JSON
  const JSONOrders: OrderFromDb[] = orders.map((order) => order.toJSON());

  // Build new orders object for frontend
  const ordersForFrontend = JSONOrders.map((order) => {
    return {
      ...order,
      Products: order.Products.map((Product) => {
        const { ProductOrder, ...rest } = Product;
        return {
          ...rest,
          quantity: ProductOrder.quantity
        };
      })
    };
  });

  return res.json({ orders: ordersForFrontend });
});

// Add new order
router.post('/', tokenExtractor, async (req: Request, res: Response) => {
  // Create new order object
  const newOrder: NewOrder = toNewOrder(req.body);

  // Send error if quantity of any product is '0'
  for (const product of newOrder.products) {
    if (product.quantity < 1) {
      return res.status(400).json({
        Error: `You're trying to order product ${product.id} with quantity '0', order failed`
      });
    }
  }

  // Test each product ID in new  order for a corresponding product in database. Send error if client is trying to add non-existent product to order.
  const productIds: string[] = newOrder.products.map((product) => product.id);

  const productsInDb: ProductModel[] = await ProductModel.findAll({
    where: {
      id: productIds
    }
  });

  if (productsInDb.length !== productIds.length || productsInDb.length === 0) {
    return res.status(400).json({
      Error: `One or more products not found in database, order failed.`
    });
  }

  // Check that all products are in stock, send error if not
  // productsInDb.forEach((product) => {
  //   if (product.dataValues.instock < 1) {
  //     return res
  //       .status(400)
  //       .json({ Error: `Product ${product.dataValues.id} not in stock, order failed` });
  //   } else {
  //     return;
  //   }
  // });

  for (const product of productsInDb) {
    if (product.dataValues.instock < 1) {
      return res
        .status(400)
        .json({
          Error: `Product ${product.dataValues.id} not in stock, order failed`
        });
    }
  }

  // Add Id to order
  const orderWithId: OrderInDb = {
    id: uuidv4(),
    ...newOrder
  };

  // Create order in database
  const orderInDb: OrderModel = await OrderModel.create(orderWithId);

  // Add products to order in database. Save quantity of each product to junction table. Subtract that amount from 'instock' property of product and update product in database
  for (const product of productsInDb) {
    // Find product in 'newOrder' array and extract quantity of product
    const orderProduct = newOrder.products.find(
      (orderProduct) => orderProduct.id === product.dataValues.id
    );
    if (!orderProduct) {
      return res.status(500).json({
        Error: `Product ${product.dataValues.id}: No match found between product in database and product in new order`
      });
    }
    const productQuantity: number = orderProduct.quantity;

    // Send error if there's not enough product in stock
    if (productQuantity > product.dataValues.instock) {
      return res.status(400).json({
        Error: `Product ${product.dataValues.id}: Not enough product in stock, order failed`
      });
    }

    // Add products to order in database
    // @ts-expect-error - Sequelize model pecial methods/mixins don't seem to work with Typescript
    await orderInDb.addProduct(product, {
      through: { quantity: productQuantity }
    });

    // Subtract amount ordered from product 'instock' value and update in database
    await product.update({
      instock: product.dataValues.instock - orderProduct.quantity
    });
  }

  return res.status(201).json({ orderInDb: orderInDb });
});

// Delete order
router.delete('/:id', tokenExtractor, async (req: Request, res: Response) => {
  if (!req.verifiedToken.isadmin) {
    return res
      .status(400)
      .json({ Error: 'Only admin users can delete orders' });
  }

  // Find order in database
  const id: string = parseString(req.params.id);
  const order: OrderModel | null = await OrderModel.findByPk(id);

  if (!order) {
    return res.status(404).json({ Error: 'Order not found' });
  }

  // If order was found, remove product-order associations from junction table and finally the order from orders table
  // @ts-expect-error - Sequelize model pecial methods/mixins don't seem to work with Typescript
  await order.setProducts([]);
  await order.destroy();
  return res.status(204).end();
});

export default router;

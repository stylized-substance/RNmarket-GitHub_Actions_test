import { Request, Response, Router } from 'express';
import { createTemporaryToken } from '#src/utils/createJWTTokens';
import { toCartItems } from '#src/utils/typeNarrowers';
import { CartItems } from '#src/types/types';

const router: Router = Router();

router.post('/', async (req: Request, res: Response) => {
  // Validate shopping cart items in request body
  const cartItems: CartItems = toCartItems(req.body);

  // Create temporary access token for authenticating to /api/orders endpoint and send to client
  const accessToken: string = createTemporaryToken(cartItems);

  res.json({ accessToken });
});

export default router;

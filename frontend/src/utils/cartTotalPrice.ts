import { CartState } from '#src/types/types.ts';

export const cartTotalPrice = (cartItems: CartState): number => {
  return cartItems && cartItems.length > 0
    ? Number(
        cartItems
          .map((item) => item.product.price * item.quantity)
          .reduce((total, item) => total + item)
          .toFixed(2)
      )
    : 0;
};

// Function adds a trailing zero to product price if needed to get to 2 decimal places
export const padPrice = (price: number): string => {
  const [integer, decimals] = String(price).split('.');

  if (!decimals) {
    return `${integer}.00`;
  }

  if (decimals.length < 2) {
    return `${integer}.${decimals.padEnd(2, '0')}`;
  }

  return String(price.toFixed(2));
};

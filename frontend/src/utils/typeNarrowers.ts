import {
  Product,
  ProductCategory,
  NewReview,
  ApiErrorResponse,
  LoginPayload,
  CartState,
  CartItem,
  ProductSortOption
} from '#src/types/types';

const isString = (param: unknown): param is string => {
  return typeof param === 'string';
};

const parseString = (param: unknown): string => {
  if (!isString(param)) {
    throw new Error(`Type error: Input is not a string`);
  }

  return param;
};

const isNumber = (param: unknown): param is number => {
  let value;

  if (typeof param === 'string') {
    value = Number(param);
  } else {
    value = param;
  }

  return typeof value === 'number' && !isNaN(value);
};

const isBoolean = (param: unknown): param is boolean => {
  return typeof param === 'boolean';
};

const isObject = (param: unknown): param is object => {
  return param !== null && typeof param === 'object';
};

const isStringArray = (param: unknown): param is string[] => {
  return Array.isArray(param) && param.every((item) => isString(item));
};

const isProductCategory = (param: string): param is ProductCategory => {
  return ['Mobiles', 'Furniture', 'Laptops'].includes(param);
};

const isNewReview = (param: unknown): param is NewReview => {
  return (
    isObject(param) &&
    'product_id' in param &&
    isString(param.product_id) &&
    'title' in param &&
    isString(param.title) &&
    'content' in param &&
    isString(param.title) &&
    'rating' in param &&
    isNumber(param.rating)
  );
};

const isProduct = (param: unknown): param is Product => {
  return (
    isObject(param) &&
    'title' in param &&
    isString(param.title) &&
    'category' in param &&
    isString(param.category) &&
    isProductCategory(param.category) &&
    'price' in param &&
    isNumber(param.price) &&
    'specs' in param &&
    isStringArray(param.specs)
  );
};

const isApiErrorResponse = (param: unknown): param is ApiErrorResponse => {
  return isObject(param) && 'Error' in param && isString(param.Error);
};

const isLoginPayload = (param: unknown): param is LoginPayload => {
  return (
    isObject(param) &&
    'username' in param &&
    isString(param.username) &&
    'name' in param &&
    isString(param.name) &&
    'id' in param &&
    isString(param.id) &&
    'isadmin' in param &&
    isBoolean(param.isadmin) &&
    'accessToken' in param &&
    isString(param.accessToken) &&
    'refreshToken' in param &&
    isString(param.refreshToken)
  );
};

const isCartItem = (param: unknown): param is CartItem => {
  return (
    isObject(param) &&
    'product' in param &&
    isProduct(param.product) &&
    'quantity' in param &&
    isNumber(param.quantity)
  );
};

const isCartState = (param: unknown): param is CartState => {
  return Array.isArray(param) && param.every((item) => isCartItem(item));
};

const isProductSortOption = (param: unknown): param is ProductSortOption => {
  return (
    isString(param) &&
    [
      'nameAsc',
      'nameDesc',
      'priceAsc',
      'priceDesc',
      'ratingAsc',
      'ratingDesc'
    ].includes(param)
  );
};

export {
  isProduct,
  isProductCategory,
  isObject,
  isString,
  parseString,
  isNewReview,
  isApiErrorResponse,
  isLoginPayload,
  isCartState,
  isProductSortOption
};

import {
  LoginPayload,
  NewOrder,
  User,
  NewUser,
  Review,
  NewReview,
  Product,
  Mobile,
  FurnitureItem,
  Laptop,
  ProductCategory,
  EditedReview,
  CartItems,
  TypeNarrowingError
} from '#src/types/types';

const isBoolean = (param: unknown): param is boolean => {
  return typeof param === 'boolean';
};

const isString = (param: unknown): param is string => {
  return typeof param === 'string';
};

const parseString = (param: unknown): string => {
  if (!isString(param)) {
    throw new TypeNarrowingError(`Input (${param}) is not a string`);
  }

  return param;
};

const isNumber = (param: unknown): param is number => {
  if (typeof param === 'number' && !isNaN(param)) {
    return true;
  }

  if (typeof param === 'string' && param.trim() !== '') {
    return !isNaN(Number(param));
  }

  return false;
};

const parseNumber = (param: unknown): number => {
  if (!isNumber(param)) {
    throw new TypeNarrowingError(`Input (${param}) is not a number`);
  }

  return param;
};

const isObject = (param: unknown): param is object => {
  return param !== null && typeof param === 'object';
};

const isStringArray = (param: unknown): param is string[] => {
  return Array.isArray(param) && param.every((item) => isString(item));
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

const isNewOrder = (param: unknown): param is NewOrder => {
  return (
    isObject(param) &&
    'products' in param &&
    Array.isArray(param.products) &&
    param.products.every((product) => {
      return (
        isObject(product) &&
        'id' in product &&
        isString(product.id) &&
        'quantity' in product &&
        isNumber(product.quantity)
      );
    }) &&
    'email' in param &&
    isString(param.email) &&
    'name' in param &&
    isString(param.name) &&
    'address' in param &&
    isString(param.address) &&
    'zipcode' in param &&
    isString(param.zipcode) &&
    'city' in param &&
    isString(param.city) &&
    'country' in param &&
    isString(param.country)
  );
};

const isCartItems = (param: unknown): param is CartItems => {
  return (
    isObject(param) &&
    'products' in param &&
    Array.isArray(param.products) &&
    param.products.length > 0 &&
    param.products.every((product) => {
      return (
        isObject(product) &&
        'id' in product &&
        isString(product.id) &&
        'quantity' in product &&
        isNumber(product.quantity)
      );
    })
  );
};

const toCartItems = (param: unknown): CartItems => {
  if (!isCartItems(param)) {
    throw new TypeNarrowingError('Input is not a valid shopping cart');
  }

  return param;
};

const isUser = (param: unknown): param is User => {
  return (
    isObject(param) &&
    'id' in param &&
    isString(param.id) &&
    'username' in param &&
    isString(param.username) &&
    'name' in param &&
    isString(param.name) &&
    'isadmin' in param &&
    isBoolean(param.isadmin)
  );
};

const isNewUser = (param: unknown): param is NewUser => {
  return (
    isObject(param) &&
    'username' in param &&
    isString(param.username) &&
    'name' in param &&
    isString(param.name) &&
    'password' in param &&
    isString(param.password) &&
    'isadmin' in param &&
    isBoolean(param.isadmin)
  );
};
const toNewOrder = (param: unknown): NewOrder => {
  if (!isNewOrder(param)) {
    throw new TypeNarrowingError('Input is not a valid order');
  }

  return param;
};

const toNewUser = (param: unknown): NewUser => {
  if (!isNewUser(param)) {
    throw new TypeNarrowingError('Input is not a valid new user');
  }

  return param;
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

const isEditedReview = (param: unknown): param is EditedReview => {
  return (
    isObject(param) &&
    'title' in param &&
    isString(param.title) &&
    'content' in param &&
    isString(param.title) &&
    'rating' in param &&
    isNumber(param.rating)
  );
};

const isReview = (param: unknown): param is Review => {
  return (
    isNewReview(param) &&
    'id' in param &&
    isString(param.id) &&
    'user_id' in param &&
    isString(param.user_id) &&
    'name' in param &&
    isString(param.name)
  );
};

const toNewReview = (param: unknown): NewReview => {
  if (!isNewReview(param)) {
    throw new TypeNarrowingError('Input is not a valid new review');
  }

  return param;
};

const toEditedReview = (param: unknown): EditedReview => {
  if (!isEditedReview(param)) {
    throw new TypeNarrowingError('Input is not a valid edited review');
  }

  return param;
};

const isProductCategory = (param: string): param is ProductCategory => {
  return Object.values(ProductCategory)
    .map((value) => value.toString())
    .includes(param);
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

const isProductWithId = (param: unknown): param is Product => {
  return isProduct(param) && 'id' in param && isString(param.id);
};

const isMobile = (product: Product): product is Mobile => {
  return (
    product.category === 'Mobiles' &&
    'brand' in product &&
    isString(product.brand) &&
    'ram' in product &&
    isString(product.ram)
  );
};

const isFurnitureItem = (product: Product): product is FurnitureItem => {
  return (
    product.category === 'Furniture' &&
    'type' in product &&
    isString(product.type)
  );
};

const isLaptop = (product: Product): product is Laptop => {
  return (
    product.category === 'Laptops' &&
    'for' in product &&
    isString(product.for) &&
    'brand' in product &&
    isString(product.brand) &&
    'ram' in product &&
    isString(product.ram) &&
    'processor' in product &&
    isString(product.processor) &&
    'displaysize' in product &&
    isString(product.displaysize) &&
    'has_ssd' in product &&
    isString(product.has_ssd)
  );
};

const parseProductCategory = (param: unknown): ProductCategory => {
  if (!isString(param) || !isProductCategory(param)) {
    throw new TypeNarrowingError(`Invalid product category (${param})`);
  }

  return param;
};

const toProduct = (param: unknown): Product => {
  if (!isProduct(param)) {
    throw new TypeNarrowingError('Object has incorrect data for a product');
  }

  switch (param.category) {
    case 'Mobiles': {
      if (!isMobile(param)) {
        throw new TypeNarrowingError('Object has incorrect data for a mobile');
      }
      return param;
    }
    case 'Furniture': {
      if (!isFurnitureItem(param)) {
        throw new TypeNarrowingError(
          'Object has incorrect data for a furniture item'
        );
      }
      return param;
    }
    case 'Laptops': {
      if (!isLaptop(param)) {
        throw new TypeNarrowingError(
          'Object has incorrect data for a laptop item'
        );
      }
      return param;
    }
    default: {
      const _exhaustiveCheck: never = param;
      return _exhaustiveCheck;
    }
  }
};

export {
  isString,
  parseString,
  isNumber,
  parseNumber,
  isLoginPayload,
  isNewOrder,
  toNewOrder,
  toCartItems,
  isReview,
  toNewReview,
  toEditedReview,
  toProduct,
  isUser,
  isNewUser,
  toNewUser,
  parseProductCategory,
  isProductWithId,
  isProduct,
  TypeNarrowingError,
  isBoolean
};

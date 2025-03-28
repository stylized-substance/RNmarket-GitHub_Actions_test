import { products } from '../../data/data.json';
import _ from 'lodash';

const findCommonProperties = () => {
  const productProperties = products.map((product) => Object.keys(product));
  const commonProperties = _.intersection(...productProperties);
  return commonProperties;
};

export const findExtraPropertiesForCategory = (category: string) => {
  const commonProperties = findCommonProperties();
  const categoryContents = products.filter(
    (product) => product.category === category
  );
  const categoryContentsProperties = _.uniq(
    categoryContents.map((product) => Object.keys(product)).flat()
  );
  const extraProperties = _.difference(
    categoryContentsProperties,
    commonProperties
  );
  return [commonProperties, extraProperties];
};

const findProductsByProperty = (property: string, include: boolean) => {
  let result;
  if (include) {
    result = products.filter((product) =>
      Object.keys(product).includes(property)
    );
  } else {
    result = products.filter(
      (product) => !Object.keys(product).includes(property)
    );
  }

  result = result.map((product) => {
    if (product.popular) {
      return {
        category: product.category,
        popular: product.popular
      };
    } else {
      return {
        category: product.category,
        popular: null
      };
    }
  });

  return result;
};

export { findProductsByProperty };

const fs = require('fs');
const { categories, products } = require('./data');

// Lowercase all object keys and transform 'hasssd' and 'id' properties. Also make sure 'specs' is an array of strings
const toLowerCase = (param) => {
  const entries = Object.entries(param);
  const lowerCased = entries.map(([key, value]) => {
    key = key.toLowerCase()
    if (key === 'hasssd') {
      key = 'has_ssd'
    }
    if (key === 'id') {
      key = 'original_id'
    }
    if (key === 'specs' && !Array.isArray(value)) {
      value = [value]
    }

    return [key, value];
  })
  const newObject = Object.fromEntries(lowerCased)
  return newObject;
};

// Concatenating categories and products
let data = { categories: categories, products: products.map(product => toLowerCase(product)) };

// Converting JS Object to JSON
let dataInJSON = JSON.stringify(data);

// Writing data in JSON format to data.json
fs.writeFile('./data.json', dataInJSON, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Success!');
});

import { Model, DataTypes } from 'sequelize';

import { sequelize } from '#src/utils/database';

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    original_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    imgs: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    specs: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false
    },
    instock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    eta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    popular: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    brand: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ram: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    for: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    displaysize: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    has_ssd: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'Product'
  }
);

export default Product;

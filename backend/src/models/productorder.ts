import { Model, DataTypes } from 'sequelize';

import { sequelize } from '#src/utils/database';

class ProductOrder extends Model {}

// This is a model for the junction table connecting products to orders and vice versa
ProductOrder.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'ProductOrder'
  }
);

export default ProductOrder;

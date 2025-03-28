import { Model, DataTypes } from 'sequelize';

import { sequelize } from '#src/utils/database';

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    name: {
      type: DataTypes.TEXT
    },
    title: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    },
    rating: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'Review'
  }
);

export default Review;

import { DataTypes } from 'sequelize';

// @ts-expect-error - no type available for queryInterface
export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('product_orders', {
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'orders', key: 'id' }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  });
};
// @ts-expect-error - no type available for queryInterface
export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('product_orders');
};

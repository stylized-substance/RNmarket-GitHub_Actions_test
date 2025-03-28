import { DataTypes } from 'sequelize';

// @ts-expect-error - no type available for queryInterface
export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    zipcode: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    country: {
      type: DataTypes.TEXT,
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
  await queryInterface.dropTable('orders');
};

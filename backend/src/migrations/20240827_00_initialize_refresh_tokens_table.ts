import { DataTypes } from 'sequelize';

// @ts-expect-error - no type available for queryInterface
export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('refresh_tokens', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiry_date: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
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
  await queryInterface.dropTable('refresh_tokens');
};

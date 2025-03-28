import { DataTypes } from 'sequelize';

// @ts-expect-error - no type available for queryInterface
export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('products', {
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
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    username: {
      type: DataTypes.TEXT,
      unique: true,
      validate: {
        isEmail: true
      },
      allowNull: false
    },
    name: {
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
    },
    passwordhash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  });
  await queryInterface.createTable('reviews', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
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
  for (const table of ['products', 'reviews', 'users']) {
    await queryInterface.dropTable(table);
  }
};

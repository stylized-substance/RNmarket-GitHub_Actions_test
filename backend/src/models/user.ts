import { Model, DataTypes } from 'sequelize';

import { sequelize } from '#src/utils/database';

class User extends Model {}

User.init(
  {
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
    passwordhash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  },
  {
    hooks: {
      // Omit password hash and timestamps after user creation or password change so they don't get sent to frontend
      afterCreate: (record) => {
        delete record.dataValues.passwordhash;
        delete record.dataValues.updatedAt;
        delete record.dataValues.createdAt;
      },
      afterUpdate: (record) => {
        delete record.dataValues.passwordhash;
      }
    },
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'User'
  }
);

export default User;

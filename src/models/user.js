import Sequelize from 'sequelize';
import { encrypt } from '../utils/secure';


const dataTypes = {
  email: {
    type: Sequelize.STRING,
    unique: {
      args: true,
      msg: 'Sorry, user with this email already registered'
    },
    allowNull: false,
    validate: {
      isEmail: {
        args: true,
        msg: 'Email you have entered is not valid'
      },
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: 'First or Lastname must use only Alphabet letters',
      },
      len: {
        args: [2, 16],
        msg: 'First or Lastname length must be from 2 to 16 letters',
      },
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isAlpha: {
        args: true,
        msg: 'First or Lastname must use only Alphabet letters',
      },
      len: {
        args: [2, 16],
        msg: 'First or Lastname length must be from 2 to 16 letters',
      },
    },
  },
  passwordEncrypted: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
  password: {
    type: Sequelize.VIRTUAL,
    set(value) {
      this.setDataValue('passwordEncrypted', encrypt(value));
      this.setDataValue('password', value);
    },
    validate: {
      len: {
        args: [4, +Infinity],
        msg: 'Please use a longer password (4 or more symbols)',
      },
    },
  },
  roleId: {
    type: Sequelize.INTEGER,
    defaultValue: 2,
  },
  address: {
    type: Sequelize.STRING,
  },
};

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: dataTypes.firstName,
    lastName: dataTypes.lastName,
    email: dataTypes.email,
    passwordEncrypted: dataTypes.passwordEncrypted,
    password: dataTypes.password,
    roleId: dataTypes.roleId,
    address: dataTypes.address, // temporary parameter, should be an entity model
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.getFullname = function(models) {
    return [this.firstName, this.lastName].join(' ');
  };

  User.prototype.hasUpdatedProfile = function(models) {
    return this.createdAt !== this.updatedAt;
  };

  User.prototype.hasDefaultPassword = function(models) {
    const defaultPassword = `${this.firstName}${this.lastName}`.toLowerCase();
    return encrypt(defaultPassword) === this.passwordEncrypted;
  };

  return User;
};


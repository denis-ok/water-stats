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
        args: [6, +Infinity],
        msg: 'Please use a longer password (6 or more symbols)',
      },
    },
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
    address: dataTypes.address, // temporary parameter, should be an entity model
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.getFullname = function(models) {
    return [this.firstName, this.lastName].join(' ');
  };

  return User;
};


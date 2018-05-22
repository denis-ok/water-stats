import dotenv from 'dotenv';
import { User, Role, Address } from './models';


const initModels = async () => {
  dotenv.config();

  await User.sync({ force: true });
  await Role.sync({ force: true });
  await Address.sync({ force: true });

  Role.hasMany(User, { foreignKey: 'roleId', as: 'Role' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });

  User.belongsTo(Address, { foreignKey: 'addressId', as: 'Address' });
  Address.hasOne(User, { foreignKey: 'addressId', as: 'User' });
};

const addAddresses = async () => {
  await Address.create({
    house: 1,
    flat: 11,
  });

  await Address.create({
    house: 22,
    flat: 222,
  });
};

const addRoles = async () => {
  await Role.create({
    name: 'admin',
    description: 'admin, cad add users',
  });

  await Role.create({
    name: 'user',
    description: 'user, can add water meters and add stats',
  });
};


const addUsers = async () => {
  await User.create({
    firstName: 'John',
    lastName: 'Brown',
    email: 'admin@admin.ru',
    password: process.env.WM_PASSWORD || 'qqqqqq',
    addressId: 1,
    roleId: 1,
  });


  await User.create({
    firstName: 'Sergey',
    lastName: 'Popov',
    email: 'popov@gmail.com',
    password: 'sergeypopov',
    addressId: 2,
  });


  await User.create({
    firstName: 'Vladimir',
    lastName: 'Surdin',
    email: 'surdin@mail.ru',
    password: 'qqqqqq',
    // Create user instance with address assciation at one time
    Address: {
      house: 33,
      flat: 333,
    },
  }, {
    include: [{
      model: Address,
      as: 'Address',
    }],
  });
};


export { initModels, addRoles, addUsers, addAddresses };

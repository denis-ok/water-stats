import dotenv from 'dotenv';
import { User, Role } from './models';


const initModels = async () => {
  dotenv.config();

  await User.sync({ force: true });
  await Role.sync({ force: true });

  Role.hasMany(User, { foreignKey: 'roleId', as: 'Role' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
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
  const admin = await User.create({
    firstName: 'John',
    lastName: 'Brown',
    email: 'admin@admin.ru',
    password: process.env.WM_PASSWORD || 'qqqqqq',
    address: 'Zelenograd',
  });

  await admin.setRole(1);

  await User.create({
    firstName: 'Sergey',
    lastName: 'Popov',
    email: 'popov@gmail.com',
    password: 'sergeypopov',
    address: 'Moscow',
  });


  await User.create({
    firstName: 'Vladimir',
    lastName: 'Surdin',
    email: 'surdin@mail.ru',
    password: 'qqqqqq',
    address: 'Sochi',
  });
};

export { initModels, addRoles, addUsers };


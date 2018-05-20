import dotenv from 'dotenv';
import { User, Role } from './models';


const initModels = async () => {
  dotenv.config();

  Role.hasMany(User, { foreignKey: 'roleId', as: 'Role' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });

  await User.sync({ force: true });
  await Role.sync({ force: true });
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
    firstName: 'Denis',
    lastName: 'Strelkov',
    email: 'strelkov.d.d@mail.ru',
    password: process.env.WM_PASSWORD,
    address: 'Zelenograd',
  });

  await admin.setRole(1);

  const user1 = await User.create({
    firstName: 'Sergey',
    lastName: 'Popov',
    email: 'popov@gmail.com',
    password: process.env.WM_PASSWORD,
    address: 'Moscow',
  });

  await user1.setRole(2);

  const user2 = await User.create({
    firstName: 'Vladimir',
    lastName: 'Surdin',
    email: 'surdin@mail.ru',
    password: process.env.WM_PASSWORD,
    address: 'Sochi',
  });

  await user2.setRole(2);
};

export { initModels, addRoles, addUsers };


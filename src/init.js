import dotenv from 'dotenv';
import { User, Role, Address, WaterMeter, Readout } from './models';
import genRndReadouts from './utils/genRandomReadouts';


const initModels = async () => {
  dotenv.config();

  await User.sync({ force: true });
  await Role.sync({ force: true });
  await Address.sync({ force: true });
  await WaterMeter.sync({ force: true });
  await Readout.sync({ force: true });

  Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });

  User.belongsTo(Address, { foreignKey: 'addressId', as: 'Address' });
  Address.hasOne(User, { foreignKey: 'addressId', as: 'User' });

  User.hasMany(WaterMeter, { foreignKey: 'userId', as: 'WaterMeters' });
  WaterMeter.belongsTo(User, { foreignKey: 'userId', as: 'Owner' });

  WaterMeter.hasMany(Readout, { foreignKey: 'waterMeterId', as: 'Readouts' });
  Readout.belongsTo(WaterMeter, { foreignKey: 'waterMeterId', as: 'WaterMeter' });

  await User.sync({ force: true });
  await Role.sync({ force: true });
  await Address.sync({ force: true });
  await WaterMeter.sync({ force: true });
  await Readout.sync({ force: true });
};


const addWaterMeters = async () => {
  await WaterMeter.genTwoWaterMeters();
  await WaterMeter.genTwoWaterMeters();
  await WaterMeter.genTwoWaterMeters();
  await WaterMeter.genTwoWaterMeters();
  await WaterMeter.genTwoWaterMeters();
  await WaterMeter.genTwoWaterMeters();
};


const addReadouts = async () => {
  const readouts1 = await Readout.bulkCreate(genRndReadouts(10), { returning: true });
  const readouts2 = await Readout.bulkCreate(genRndReadouts(10), { returning: true });

  const watermeter1 = await WaterMeter.findById(1);
  const watermeter2 = await WaterMeter.findById(2);

  await watermeter1.setReadouts(readouts1);
  await watermeter2.setReadouts(readouts2);


  const readouts3 = await Readout.bulkCreate(genRndReadouts(15), { returning: true });
  const readouts4 = await Readout.bulkCreate(genRndReadouts(15), { returning: true });

  const watermeter3 = await WaterMeter.findById(3);
  const watermeter4 = await WaterMeter.findById(4);

  await watermeter3.setReadouts(readouts3);
  await watermeter4.setReadouts(readouts4);


  const readouts5 = await Readout.bulkCreate(genRndReadouts(20), { returning: true });
  const readouts6 = await Readout.bulkCreate(genRndReadouts(20), { returning: true });

  const watermeter5 = await WaterMeter.findById(5);
  const watermeter6 = await WaterMeter.findById(6);

  await watermeter5.setReadouts(readouts5);
  await watermeter6.setReadouts(readouts6);


  const readouts7 = await Readout.bulkCreate(genRndReadouts(7), { returning: true });
  const readouts8 = await Readout.bulkCreate(genRndReadouts(7), { returning: true });

  const watermeter7 = await WaterMeter.findById(7);
  const watermeter8 = await WaterMeter.findById(7);

  await watermeter7.setReadouts(readouts7);
  await watermeter8.setReadouts(readouts8);


  const readouts9 = await Readout.bulkCreate(genRndReadouts(2), { returning: true });
  const readouts10 = await Readout.bulkCreate(genRndReadouts(2), { returning: true });

  const watermeter9 = await WaterMeter.findById(7);
  const watermeter10 = await WaterMeter.findById(8);

  await watermeter9.setReadouts(readouts9);
  await watermeter10.setReadouts(readouts10);
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

  await Address.create({
    house: 4,
    flat: 44,
  });

  await Address.create({
    house: 5,
    flat: 55,
  });

  await Address.create({
    house: 6,
    flat: 66,
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
  const user1 = await User.create({
    firstName: 'John',
    lastName: 'Brown',
    email: 'admin@admin.ru',
    password: process.env.WM_PASSWORD || 'qqqqqq',
    addressId: 1,
    roleId: 1,
  });

  await user1.setWaterMeters([1, 2]);


  const user2 = await User.create({
    firstName: 'Sergey',
    lastName: 'Popov',
    email: 'popov@gmail.com',
    password: 'sergeypopov',
    addressId: 2,
  });

  await user2.setWaterMeters([3, 4]);


  const user3 = await User.create({
    firstName: 'Vladimir',
    lastName: 'Surdin',
    email: 'surdin@mail.ru',
    password: 'qqqqqq',
    // Create user instance with address association at one time
    Address: {
      house: 33,
      flat: 333,
    },
    // WaterMeters: [{ waterType: 'cold' }, { waterType: 'hot' }],
  }, {
    include: [
      {
        model: Address,
        as: 'Address',
      },
      // {
      //   model: WaterMeter,
      //   as: 'WaterMeters',
      // },
    ],
  });


  await user3.setWaterMeters([5, 6]);

  const user4 = await User.create({
    firstName: 'Jeff',
    lastName: 'Loomis',
    email: 'loomis@gmail.com',
    password: 'qqqqqq',
    addressId: 4,
  });

  await user4.setWaterMeters([7, 8]);

  const user5 = await User.create({
    firstName: 'Zakk',
    lastName: 'Wylde',
    email: 'zakk@gmail.com',
    password: 'qqqqqq',
    addressId: 5,
  });

  await user5.setWaterMeters([9, 10]);

  const user6 = await User.create({
    firstName: 'Joe',
    lastName: 'Satriani',
    email: 'satch@gmail.com',
    password: 'qqqqqq',
    addressId: 6,
  });

  await user6.setWaterMeters([11, 12]);
};


export { initModels, addRoles, addUsers, addAddresses, addWaterMeters, addReadouts };

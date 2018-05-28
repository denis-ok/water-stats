import dotenv from 'dotenv';
import { User, Role, Address, WaterMeter, Readout } from './models';


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


export default initModels;

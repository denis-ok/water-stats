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

  Address.belongsTo(User, { foreignKey: 'userId', as: 'User', onDelete: 'CASCADE' });
  User.hasOne(Address, { foreignKey: 'userId', as: 'Address', onDelete: 'CASCADE' });

  User.hasMany(WaterMeter, { foreignKey: 'userId', as: 'WaterMeters', onDelete: 'CASCADE' });
  WaterMeter.belongsTo(User, { foreignKey: 'userId', as: 'Owner', onDelete: 'CASCADE' });

  WaterMeter.hasMany(Readout, { foreignKey: 'waterMeterId', as: 'Readouts', onDelete: 'CASCADE' });
  Readout.belongsTo(WaterMeter, { foreignKey: 'waterMeterId', as: 'WaterMeter', onDelete: 'CASCADE' });

  await User.sync({ force: true });
  await Role.sync({ force: true });
  await Address.sync({ force: true });
  await WaterMeter.sync({ force: true });
  await Readout.sync({ force: true });
};


export default initModels;

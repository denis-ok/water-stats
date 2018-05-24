export default (sequelize, DataTypes) => {
  const WaterMeter = sequelize.define('WaterMeter', {
    waterType: DataTypes.STRING,
  }, {});

  WaterMeter.associate = function(models) {
  };

  WaterMeter.genTwoWaterMeters = () => {
    const coldWm = WaterMeter.create({ waterType: 'cold' });
    const hotWm = WaterMeter.create({ waterType: 'hot' });
    return [coldWm, hotWm];
  };

  return WaterMeter;
};
import _ from 'lodash';

const getFirstReadoutValue = async (watermeter) => {
  const readouts = await watermeter.getReadouts({
    limit: 1,
    order: [['date', 'ASC']],
  });

  const readout = readouts[0];
  const { value } = readout;
  return value;
};

const getLastReadout = async (watermeter) => {
  const readouts = await watermeter.getReadouts({
    limit: 1,
    order: [['date', 'DESC']],
  });

  const readout = readouts[0];
  return readout;
};

const getLastReadoutValue = async (watermeter) => {
  const readouts = await watermeter.getReadouts({
    limit: 1,
    order: [['date', 'DESC']],
  });

  const readout = readouts[0];
  const { value } = readout;
  return value;
};

const getTotalConsumption = async (watermeter) => {
  const first = await getFirstReadoutValue(watermeter);
  const last = await getLastReadoutValue(watermeter);

  const consumption = last - first;
  return consumption;
};

const getReadoutsCount = async (watermeter) => {
  const readouts = await watermeter.getReadouts();
  return readouts.length;
};

const getPeriodsCount = async (watermeter) => {
  const readouts = await watermeter.getReadouts();
  const readoutsCount = readouts.length
  return readoutsCount <= 1 ? 0 : readoutsCount - 1;
};


const getAverageMonthlyConsumption = async (watermeter) => {
  const readouts = await watermeter.getReadouts();

  if (readouts.length <= 1) {
    return 0;
  }

  const periods = readouts.length - 1;

  const totalConsumption = await getTotalConsumption(watermeter);
  const result = totalConsumption / periods;

  return _.round(result, 3);
};

export default (sequelize, DataTypes) => {
  const WaterMeter = sequelize.define('WaterMeter', {
    waterType: DataTypes.STRING,
  }, {});

  WaterMeter.associate = function(models) {
  };

  WaterMeter.genTwoWaterMeters = () => {
    const wmCold = WaterMeter.create({ waterType: 'cold' });
    const wmHot = WaterMeter.create({ waterType: 'hot' });
    return [wmCold, wmHot];
  };

  WaterMeter.prototype.getReadoutsCount = function() {
    const watermeter = this;
    return getReadoutsCount(watermeter);
  };

  WaterMeter.prototype.getPeriodsCount = function() {
    const watermeter = this;
    return getPeriodsCount(watermeter);
  };

  WaterMeter.prototype.getFirstReadoutValue = function() {
    const watermeter = this;
    return getFirstReadoutValue(watermeter);
  };

  WaterMeter.prototype.getLastReadout = function() {
    const watermeter = this;
    return getLastReadout(watermeter);
  };

  WaterMeter.prototype.getLastReadoutValue = function() {
    const watermeter = this;
    return getLastReadoutValue(watermeter);
  };

  WaterMeter.prototype.getTotalConsumption = function() {
    const watermeter = this;
    return getTotalConsumption(watermeter);
  };

  WaterMeter.prototype.getAverageMonthlyConsumption = function() {
    const watermeter = this;
    return getAverageMonthlyConsumption(watermeter);
  };  

  return WaterMeter;
};
// import debugLib from 'debug';
import { WaterMeter, User } from '../models';


// const debugLog = debugLib('app:controllers:watermeters');


// const getFirstReadout = async (watermeter) => {
//   const readouts = await watermeter.getReadouts({
//     limit: 1,
//     order: [['id', 'ASC']],
//   });

//   const readout = readouts[0];
//   const { value } = readout.value;
//   return value;
// };

// const getLastReadOut = async (watermeter) => {
//   const readouts = await watermeter.getReadouts({
//     limit: 1,
//     order: [['id', 'DESC']],
//   });

//   const readout = readouts[0];
//   const { value } = readout.value;
//   return value;
// };

// const getTotalConsumption = async (watermeter) => {
//   const first = await getFirstReadout(watermeter);
//   const last = await getLastReadOut(watermeter);

//   debugLog('first:', first);
//   debugLog('last:', last);

//   const consumption = last - first;
//   return consumption;
// };

// const addTotalConsumptionProperty = async (watermeterInstance) => {
//   const watermeter = watermeterInstance;
//   const consumption = await getTotalConsumption(watermeter);
//   watermeter.totalConsumption = consumption;
//   return watermeter;
// };

// const getAverageConsumption = async (watermeter) => {
//   const readouts = await watermeter.getReadouts();
//   const count = readouts.length;
//   const sum = readouts.reduce((acc, r) => acc + r.value, 0);
//   const average = sum / count;
//   return average;
// };

// const addAverageProperty = async (watermeterInstance) => {
//   const avgConsumption = await getAverageConsumption(watermeterInstance);
//   const watermeter = watermeterInstance;
//   watermeter.avgConsumption = avgConsumption;
//   return watermeter;
// };

// const prepareWatermeters = coll => coll.map(wm => addAverageProperty(wm));

const showWatermeters = async (ctx) => {
  const watermeters = await WaterMeter.findAll({
    include: [{
      model: User,
      as: 'Owner',
    }],
  });


  ctx.render('watermeters/index', { watermeters, title: 'Watermeters List' });
};

export default showWatermeters;


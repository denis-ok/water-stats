// import debugLib from 'debug';
import { WaterMeter, User } from '../models';
import buildFormObj from '../utils/formObjectBuilder';
import { addDiffValuesDesc } from '../utils/addDiffValues';


// const debugLog = debugLib('app:controllers:watermeters');

const attachPropsToWatermeter = async (watermeter) => {
  const wm = watermeter;

  const periodsCount = await wm.getPeriodsCount();
  const avgCons = await wm.getAverageMonthlyConsumption();
  const totalConsumption = await wm.getTotalConsumption();

  wm.periodsCount = periodsCount;
  wm.averageMonthlyConsumption = avgCons;
  wm.totalConsumption = totalConsumption;

  return wm;
};

const attachPropsToWatermeterColl = wmColl =>
  Promise.all(wmColl.map(wm => attachPropsToWatermeter(wm)));

const showAllWatermeters = async (ctx) => {
  const watermeters = await WaterMeter.findAll({
    include: [{
      model: User,
      as: 'Owner',
    }],
  });


  ctx.render('watermeters/index', { watermeters, title: 'Watermeters List' });
};


const renderAddReadoutsView = async (ctx) => {
  ctx.render('watermeters/addReadouts', { formObj: buildFormObj({}), title: 'Add Readouts' });
};

const renderWatermetersUser = async (ctx) => {
  const userId = ctx.params.id;
  const user = await User.findById(userId);

  if (!user) {
    ctx.flash.set('User not exist');
    ctx.redirect('/');
    return;
  }

  const options = {
    order: [['date', 'DESC']],
  };

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const readoutsCold = await wmCold.getReadouts(options);
  const readoutsColdWithDiff = addDiffValuesDesc(readoutsCold);

  const readoutsHot = await wmHot.getReadouts(options);
  const readoutsHotWithDiff = addDiffValuesDesc(readoutsHot);

  const watermeters = await attachPropsToWatermeterColl([wmCold, wmHot]);


  const coll = readoutsColdWithDiff.map((r, i) => ({ cold: r, hot: readoutsHotWithDiff[i] }));

  ctx.render('watermeters/show', { watermeters, readouts: coll, title: 'Stats' });
};


export { showAllWatermeters, renderAddReadoutsView, renderWatermetersUser };


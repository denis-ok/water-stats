import debugLib from 'debug';
import { WaterMeter, User, Readout } from '../models';
import buildFormObj from '../utils/formObjectBuilder';
import { addDiffValuesDesc } from '../utils/addDiffValues';
// import { debuglog } from 'util';
// import { createSkippedReadouts } from '../utils/readouts/createSkippedReadouts';

const debugLog = debugLib('app:controllers:watermeters');


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
  const coldWatermeters = await WaterMeter.findAll({
    where: { waterType: 'cold' },
    include: [{
      model: User,
      as: 'Owner',
    }],
  });

  const hotWatermeters = await WaterMeter.findAll({
    where: { waterType: 'hot' },
    include: [{
      model: User,
      as: 'Owner',
    }],
  });

  const preparedColdWatermeters = await attachPropsToWatermeterColl(coldWatermeters);
  const preparedHotWatermeters = await attachPropsToWatermeterColl(hotWatermeters);

  const coldSorted = preparedColdWatermeters.sort((a, b) =>
    b.averageMonthlyConsumption - a.averageMonthlyConsumption);

  const hotSorted = preparedHotWatermeters.sort((a, b) =>
    b.averageMonthlyConsumption - a.averageMonthlyConsumption);

  const watermeters = preparedColdWatermeters.reduce((acc, wm, i) =>
    [...acc, wm, preparedHotWatermeters[i]], []);

  ctx.render('watermeters/index', {
    watermeters,
    coldWatermeters: coldSorted,
    hotWatermeters: hotSorted,
    title: 'Watermeters List',
  });
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

const renderAddReadoutsView = async (ctx) => {
  const userId = ctx.params.id;

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  const lastReadoutHot = await wmHot.getLastReadout();

  ctx.render('watermeters/addReadouts', {
    lastReadoutCold, lastReadoutHot, userId, formObj: buildFormObj({}), title: 'Add Readouts',
  });
};

const validateInput = async (ctx, next) => {
  const userId = ctx.params.id;
  const form = await ctx.request.body;

  if (form.coldValue === '' || form.hotValue === '') {
    ctx.flash.set('Fields cannot be blank');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    return;
  }

  const coldValue = Number(form.coldValue);
  const hotValue = Number(form.hotValue);

  if (Number.isNaN(coldValue) || Number.isNaN(hotValue)) {
    ctx.flash.set('Please type only numbers in forms');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    return;
  }

  if (!Number.isInteger(coldValue) || !Number.isInteger(hotValue)) {
    ctx.flash.set('Please use only integer numbers in forms');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    return;
  }

  await next();
};

const createFirstReadouts = async (ctx, next) => {
  const userId = ctx.params.id;
  const form = await ctx.request.body;

  const coldValue = Number(form.coldValue);
  const hotValue = Number(form.hotValue);


  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  const lastReadoutHot = await wmHot.getLastReadout();

  if (!lastReadoutCold && !lastReadoutHot) {
    debugLog('User is adding first readouts...');

    const currentDate = Date.now();
    const newReadoutCold = { value: coldValue, date: currentDate, waterMeterId: wmCold.id };
    const newReadoutHot = { value: hotValue, date: currentDate, waterMeterId: wmHot.id };

    try {
      debugLog('Try to save readouts...');
      await Readout.create(newReadoutCold);
      await Readout.create(newReadoutHot);
      ctx.flash.set('Thank you! Readouts has been created');
      ctx.redirect('/');
    } catch (e) {
      debugLog('Catch error:', e);
      ctx.flash.set('Error, something gone wrong!');
      ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    }
    return;
  }

  await next();
};

const checkGreaterThenLatest = async (ctx, next) => {
  const userId = ctx.params.id;
  const form = await ctx.request.body;

  const coldValue = Number(form.coldValue);
  const hotValue = Number(form.hotValue);

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  const lastReadoutHot = await wmHot.getLastReadout();

  const lastColdVal = Number(lastReadoutCold.value);
  const lastHotVal = Number(lastReadoutHot.value);

  if (coldValue < lastColdVal || hotValue < lastHotVal) {
    ctx.flash.set('Your new readouts cannot be smaller than last');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    return;
  }

  await next();
};


const createReadouts = async (ctx) => {
  const userId = ctx.params.id;
  // const form = await ctx.request.body;

  // const coldValue = Number(form.coldValue);
  // const hotValue = Number(form.hotValue);

  // const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  // const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  // const lastReadoutCold = await wmCold.getLastReadout();
  // const lastReadoutHot = await wmHot.getLastReadout();

  // const lastColdVal = Number(lastReadoutCold.value);
  // const lastHotVal = Number(lastReadoutHot.value);


  // const skippedReadoutsCold = await createSkippedReadouts(Readout, currentDate, lastReadoutCold);
  // const skippedReadoutsHot = await createSkippedReadouts(Readout, currentDate, lastReadoutHot);

  // const newReadoutCold = { value: coldValue, date: currentDate.toString() };
  // const newReadoutHot = { value: hotValue, date: currentDate.toString() };

  // try {
  //   debugLog('Try to save readouts...');
  //   await Readout.save(newReadoutCold);
  //   await Readout.save(newReadoutHot);
  //   ctx.flash.set('Thank you! Readouts has been created');
  //   ctx.redirect('/');
  // } catch (e) {
  //   debugLog('Catch error:', e);
  //   ctx.flash.set('Error, something gone wrong!');
  //   ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
  // }

  ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
};


export {
  showAllWatermeters,
  renderAddReadoutsView,
  renderWatermetersUser,
  validateInput,
  createFirstReadouts,
  checkGreaterThenLatest,
  createReadouts,
};


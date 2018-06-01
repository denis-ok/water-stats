import debugLib from 'debug';
import { sequelize, WaterMeter, User, Readout } from '../models';
import buildFormObj from '../utils/formObjectBuilder';
import { addDiffValuesDesc } from '../utils/addDiffValues';
import isNextPeriod from '../utils/isNextPeriod';
import { createSkippedReadouts } from '../utils/readouts/createSkippedReadouts';

const debugLog = debugLib('app:controllers:watermeters');

const getMonthsDiffBetweenDates = (currentDateObj, previousDateObj) => {
  if (currentDateObj <= previousDateObj) {
    return 0;
  }

  const currentMonth = currentDateObj.getMonth();
  const currentYear = currentDateObj.getFullYear();

  const previousMonth = previousDateObj.getMonth();
  const previousYear = previousDateObj.getFullYear();

  const skippedYearMonthsOnly = (currentYear - previousYear) * 12;
  const skippedMonthsOnly = Math.abs(currentMonth - previousMonth);

  const skippedMonthsCount = Math.abs(skippedYearMonthsOnly - skippedMonthsOnly);
  return skippedMonthsCount;
};

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

  if (!lastReadoutCold && !lastReadoutCold) {
    ctx.state.isNextPeriod = true;
  }

  if (lastReadoutCold && lastReadoutHot) {
    const currentDate = new Date(Date.now());
    const lastColdDate = new Date(lastReadoutCold.date);
    ctx.state.isNextPeriod = isNextPeriod(currentDate, lastColdDate);
  }

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

  if (coldValue > 99999 || hotValue > 99999) {
    ctx.flash.set('Maximum value for fields is 99999');
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
      await sequelize.transaction(async (t) => {
        await Readout.create(newReadoutCold, { transaction: t });
        await Readout.create(newReadoutHot, { transaction: t });
      });

      ctx.flash.set('Thank you! Readouts has been created');
      ctx.redirect(`/watermeters/user/${userId}`);
    } catch (e) {
      debugLog('Catch error:', e);
      ctx.flash.set('Error, something gone wrong!');
      ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    }
    return;
  }

  await next();
};


const checkDate = async (ctx, next) => {
  const userId = ctx.params.id;

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  // const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  // const lastReadoutHot = await wmHot.getLastReadout();

  const currentDate = new Date(Date.now());

  const lastColdDate = new Date(lastReadoutCold.date);
  // const lastHotDate = new Date(lastReadoutHot.date);

  if (isNextPeriod(currentDate, lastColdDate) === false) {
    ctx.flash.set('Sorry, its to early to add new readouts, please try again on next month');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
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


const createIfNextMonth = async (ctx, next) => {
  const userId = ctx.params.id;

  const form = await ctx.request.body;
  const coldValue = Number(form.coldValue);
  const hotValue = Number(form.hotValue);

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  // const lastReadoutHot = await wmHot.getLastReadout();

  const currentDate = new Date(Date.now());

  const lastColdDate = new Date(lastReadoutCold.date);
  // const lastHotDate = new Date(lastReadoutHot.date);

  const monthsDiff = getMonthsDiffBetweenDates(currentDate, lastColdDate);

  if (monthsDiff === 1) {
    const newReadoutCold = { value: coldValue, date: currentDate, waterMeterId: wmCold.id };
    const newReadoutHot = { value: hotValue, date: currentDate, waterMeterId: wmHot.id };

    try {
      debugLog('Try to save readouts...');

      await sequelize.transaction(async (t) => {
        await Readout.create(newReadoutCold, { transaction: t });
        await Readout.create(newReadoutHot, { transaction: t });
      });

      ctx.flash.set('Thank you! Readouts has been created');
      ctx.redirect(`/watermeters/user/${userId}`);
    } catch (e) {
      debugLog('Catch error:', e);
      ctx.flash.set('Error, something gone wrong!');
      ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
    }
    return;
  }

  await next();
};


const createWithSkippedReadouts = async (ctx) => {
  const userId = ctx.params.id;
  const form = await ctx.request.body;

  const coldValue = Number(form.coldValue);
  const hotValue = Number(form.hotValue);

  const wmCold = await WaterMeter.findOne({ where: { userId, waterType: 'cold' } });
  const wmHot = await WaterMeter.findOne({ where: { userId, waterType: 'hot' } });

  const lastReadoutCold = await wmCold.getLastReadout();
  const lastReadoutHot = await wmHot.getLastReadout();

  const currentDate = new Date(Date.now());

  const newReadoutCold = { value: coldValue, date: currentDate, waterMeterId: wmCold.id };
  const newReadoutHot = { value: hotValue, date: currentDate, waterMeterId: wmHot.id };

  try {
    debugLog('Try to save readouts...');

    await createSkippedReadouts(Readout, currentDate, lastReadoutCold);
    await createSkippedReadouts(Readout, currentDate, lastReadoutHot);

    await sequelize.transaction(async (t) => {
      await Readout.create(newReadoutCold, { transaction: t });
      await Readout.create(newReadoutHot, { transaction: t });
    });

    ctx.flash.set('Thank you! Readouts has been created');
    ctx.redirect(`/watermeters/user/${userId}`);
  } catch (e) {
    debugLog('Catch error:', e);
    ctx.flash.set('Error, something gone wrong!');
    ctx.redirect(`/watermeters/user/${userId}/addreadouts`);
  }
};

export {
  showAllWatermeters,
  renderAddReadoutsView,
  renderWatermetersUser,
  validateInput,
  createFirstReadouts,
  checkDate,
  checkGreaterThenLatest,
  createIfNextMonth,
  createWithSkippedReadouts,
};


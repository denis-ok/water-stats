import getSkippedMonthsBetweenDatesCount from '../getSkippedMonthsBetweenDatesCount';

const genSkippedMonthsDates = (currentDateObj, previousDateObj) => {
  const count = getSkippedMonthsBetweenDatesCount(currentDateObj, previousDateObj);

  if (count === 0) {
    return [];
  }

  const genDatesArr = (counter, initDate) => {
    if (counter === 0) {
      return [];
    }

    const initYear = initDate.getFullYear();
    const initMonth = initDate.getMonth();
    const initDay = initDate.getDay();

    console.log('initDate', initDate);

    const skippedDate = new Date(initYear, initMonth + 1, initDay);
    return [skippedDate.toString(), ...genDatesArr(counter - 1, skippedDate)];
  };

  const result = genDatesArr(count, previousDateObj);
  return result;
};


const genSkippedReadouts = (currentDateObj, lastReadout) => {
  const previousDateObj = new Date(lastReadout.date);

  const skippedMonthsDates = genSkippedMonthsDates(currentDateObj, previousDateObj);

  if (skippedMonthsDates.length === 0) {
    return [];
  }

  const wmId = lastReadout.waterMeterId;

  const skippedReadouts = skippedMonthsDates.map(date =>
    ({ date, value: lastReadout.value, waterMeterId: wmId }));

  return skippedReadouts;
};


const createSkippedReadouts = async (readoutModel, currentDateObj, lastReadout) => {
  const skippedReadouts = genSkippedReadouts(currentDateObj, lastReadout);

  if (skippedReadouts.length === 0) {
    return [];
  }

  const newReadouts = await readoutModel.bulkCreate(skippedReadouts, { returning: true });
  return newReadouts;
};

export {
  getSkippedMonthsBetweenDatesCount,
  genSkippedMonthsDates,
  genSkippedReadouts,
  createSkippedReadouts,
};

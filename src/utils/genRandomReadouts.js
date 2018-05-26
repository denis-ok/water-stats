const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const genRndNum = () => getRandomInt(1, 25);

const genRndValuesArr = (quantity, startValue = 0) => {
  if (quantity === 0) {
    return [];
  }

  const value = genRndNum() + startValue;

  return [value, ...genRndValuesArr(quantity - 1, value)];
};

const genDates = (count, initDateArr = [2015, 0]) => {
  if (count === 0) {
    return [];
  }

  const randomDay = getRandomInt(1, 28);

  const [year, month] = initDateArr;

  const dateString = new Date(year, month, randomDay).toString();
  const nextMonthDate = [year, month + 1];

  return [dateString, ...genDates(count - 1, nextMonthDate)];
};


const genRndReadouts = (count = 10, initDate) => {
  const values = genRndValuesArr(count);
  const dates = genDates(count, initDate);

  const result = values.map((val, i) => ({ value: val, date: dates[i] }));
  return result;
};

export default genRndReadouts;

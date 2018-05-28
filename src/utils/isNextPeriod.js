const isNextPeriod = (currentDateObj, previousDateObj) => {
  const currentYear = currentDateObj.getFullYear();
  const previousYear = previousDateObj.getFullYear();

  if (currentYear > previousYear) {
    return true;
  }

  const currentMonth = currentDateObj.getMonth();
  const previousMonth = previousDateObj.getMonth();

  if (currentMonth > previousMonth) {
    return true;
  }

  return false;
};

export default isNextPeriod;

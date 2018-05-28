const getSkippedMonthsBetweenDatesCount = (currentDateObj, previousDateObj) => {
  if (currentDateObj <= previousDateObj) {
    return 0;
  }

  const currentMonth = currentDateObj.getMonth();
  const currentYear = currentDateObj.getFullYear();

  const previousMonth = previousDateObj.getMonth();
  const previousYear = previousDateObj.getFullYear();

  const skippedYearMonthsOnly = (currentYear - previousYear) * 12;
  const skippedMonthsOnly = Math.abs(currentMonth - previousMonth);

  const skippedMonthsCount = Math.abs(skippedYearMonthsOnly - skippedMonthsOnly) - 1;
  return skippedMonthsCount;
};

export default getSkippedMonthsBetweenDatesCount;

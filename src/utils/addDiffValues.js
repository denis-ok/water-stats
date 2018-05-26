const addDiffValuesAsc = coll => coll.map((obj, i) => {
  const currentObj = obj;

  if (i === 0) {
    currentObj.diffValue = 0;
    return currentObj;
  }

  const currentValue = obj.value;
  const previousObj = coll[i - 1];
  const previousValue = previousObj.value;

  const diffValue = currentValue - previousValue;
  currentObj.diffValue = diffValue;
  return currentObj;
});

const addDiffValuesDesc = coll => coll.map((obj, i) => {
  const currentObj = obj;

  if (i === coll.length - 1) {
    currentObj.diffValue = 0;
    return currentObj;
  }

  const currentValue = obj.value;
  const previousObj = coll[i + 1];
  const previousValue = previousObj.value;

  const diffValue = currentValue - previousValue;
  currentObj.diffValue = diffValue;
  return currentObj;
});

export { addDiffValuesAsc, addDiffValuesDesc };

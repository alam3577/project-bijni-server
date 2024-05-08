exports.filterBodyObj = (obj, ...allowedFields) => {
  const objElem = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      objElem[el] = obj[el];
    }
  });
  return objElem;
};

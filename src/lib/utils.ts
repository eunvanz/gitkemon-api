export const getCleanObject = (obj: { [key: string]: any }) => {
  Object.keys(obj).forEach((key) => {
    obj[key] ?? delete obj[key];
  });
  return obj;
};

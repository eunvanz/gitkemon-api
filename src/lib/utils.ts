export const getCleanObject = (obj: { [key: string]: any }) => {
  Object.keys(obj).forEach((key) => {
    obj[key] ?? delete obj[key];
  });
  return obj;
};

/**
 * 전달된 Date의 자정으로 세팅된 Date 객체를 리턴
 * @param date Date 객체
 * @returns 자정 Date 객체
 */
export const getMidnightDate = (date: Date) => {
  return new Date(date.setHours(0, 0, 0, 0));
};

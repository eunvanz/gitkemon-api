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

/**
 * n과 m 사이 x의 배수 개수를 리턴
 * @param x 배수
 * @param n 구간 시작 숫자
 * @param m 구간 끝 숫자
 * @returns n과 m 사이의 x의 배수 갯수
 */
export const getMultiplesCountBetween = (x: number, n: number, m: number) => {
  let cnt = 0;
  for (let i = n; i <= m; i++) {
    if (i % x === 0) {
      cnt++;
    }
  }
  return cnt;
};

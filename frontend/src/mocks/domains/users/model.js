import rawUsersData from './data.json';

// TODO: JSDoc type 정의 (예: UserData)

/**
 * users.json 데이터를 앱에서 사용할 수 있는 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 */
export const usersDB = rawUsersData.map((user) => ({
  ...user,
  // 필요한 경우 날짜 문자열을 Date 객체로 변환 등 데이터 가공
}));

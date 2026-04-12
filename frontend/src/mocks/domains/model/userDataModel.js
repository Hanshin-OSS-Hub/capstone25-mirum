import rawUsersData from '../../../../../global/data/dummyUser.json';

/** @typedef {import('@/types/user.js').UserData} UserData */

/**
 * users.json 데이터를 앱에서 사용할 수 있는 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 * @type {UserData[]}
 */
export const usersDB = rawUsersData.map((user) => ({
  username: user.username,
  password: user.password,
  role: /** @type {UserData['role']} */ (user.role),
  isLock: user.isLock,
  isSocial: user.isSocial,
  socialProviderType: user.socialProviderType,
  nickname: user.nickname,
  email: user.email,
  profileImg: user.profileImg,
  createdDate: new Date(user.createdDate),
  updatedDate: new Date(user.updatedDate),
}));

export const successResponse = (data, status = 200) => {
  return Response.json(
    {
      code: status,
      message: 'Success',
      data,
    },
    { status },
  );
};

export const errorResponse = (message, status = 400) => {
  return Response.json(
    {
      code: status,
      message,
    },
    { status },
  );
};

// 가짜 JWT 생성
export const createToken = (username, type = 'access') => {
  const payload = btoa(JSON.stringify({ username, type, exp: Date.now() + 3600000 }));
  return `mock.${payload}.signature`;
};

export const parseUsername = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).username;
  } catch (e) {
    return null;
  }
};

export const successResponse = (data, status = 200) => {
  return Response.json(
    {
      success: true,
      message: '성공',
      data,
    },
    { status },
  );
};

export const errorResponse = (message, status = 400) => {
  return Response.json(
    {
      success: false,
      message: '에러 발생',
      data: null,
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
    if (!token) return null;
    if (token.startsWith('mock.')) {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)).username;
    }

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(paddedPayload)).username;
  } catch (error) {
    return null;
  }
};

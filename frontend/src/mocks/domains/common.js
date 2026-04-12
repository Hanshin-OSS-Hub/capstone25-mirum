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
      message: message,
      data: null,
    },
    { status },
  );
};

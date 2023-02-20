export const genrateMessage = (msg) => {
  return {
    msg,
    createdAt: new Date().getTime(),
  };
};

export const genrateLocation = (loc) => {
  return {
    loc,
    createdAt: new Date().getTime(),
  };
};

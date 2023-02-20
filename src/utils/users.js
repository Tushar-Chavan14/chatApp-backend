const users = [];

export const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "username and room required",
    };
  }

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) {
    return {
      error: "username already in use",
    };
  }

  const user = { id, username, room };

  users.push(user);

  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUsersInRooms = (room) => {
  return users.filter((user) => user.room === room);
};

// console.log(addUser({ id: 22, username: "tushar", room: "java" }));
// // addUser({ id: 32, username: "tushar", room: "mava" });
// // addUser({ id: 42, username: "tusha", room: "mava" });
// addUser({ id: 52, username: "atish", room: "mava" });

console.log(users);

// console.log(removeUser(22));
// console.log(getUser(52));

// // console.log(getUsersInRooms("pava"));

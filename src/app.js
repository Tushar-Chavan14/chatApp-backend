import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Filter from "bad-words";
import { genrateLocation, genrateMessage } from "./utils/genrateMessages.js";
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRooms,
} from "./utils/users.js";

const app = express();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: "*",
  },
});

const port = process.env.PORT || 3000;

const publicPath = new URL("../public/", import.meta.url).pathname;

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  const filter = new Filter();
  console.log(`client connected ${socket.id}`);

  socket.on("join", (users, callback) => {
    const { error, user } = addUser({ id: socket.id, ...users });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", genrateMessage(`welcome ${user.username}`));
    socket.broadcast
      .to(user.room)
      .emit("message", genrateMessage(`${user.username} Joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRooms(user.room),
    });

    callback();
  });

  socket.on("clienMessage", (message, callback) => {
    const { username, room } = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("bsdk badwords not allowed");
    }

    socket.broadcast
      .to(room)
      .emit("message", genrateMessage(message), username);

    callback();
  });

  socket.on("location", (loc, callback) => {
    const { username, room } = getUser(socket.id);

    socket.broadcast
      .to(room)
      .emit(
        "locMessage",
        genrateLocation(
          `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
        ),
        username
      );

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", genrateMessage(`${user.username} left`));

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRooms(user.room),
      });
    }
  });
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

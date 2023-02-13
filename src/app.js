import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Filter from "bad-words";

const app = express();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: "*",
  },
});

const port = process.env.PORT || 3000;

const publicPath = new URL("../public/", import.meta.url).pathname;

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  const filter = new Filter();
  console.log(`client connected ${socket.id}`);

  socket.on("join", ({ username, room }) => {
    socket.broadcast.emit("message", `welcome ${username}`);
  });

  socket.on("clienMessage", (message, callback) => {
    if (filter.isProfane(message)) {
      return callback("bsdk badwords not allowed");
    }

    io.emit("message", message);

    callback();
  });

  socket.on("location", (loc, callback) => {
    socket.broadcast.emit(
      "locMessage",
      `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
    );

    callback();
  });

  socket.on("disconnect", () => io.emit("message", `${socket.id} left`));
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

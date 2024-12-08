require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const questions = [
  "what will be the output of -10 + 10",
  "what will be the output of 'a' === 1 ",
  "what will be the output tpyeof NaN",
];

let activeUsers = [];
let response = [];
let question = null;
let questionStartsTime = null;

app.use(
  cors({
    origin: "*",
    method: ["GET", "POST"],
  })
);

io.on("connection", (socket) => {
  if (activeUsers.length >= 1) {
    socket.emit("error", "No more users allowed!");
    socket.disconnect();
    return;
  }

  console.log("user connected", socket.id);
  activeUsers.push(socket.id);
  console.log(activeUsers.length);

  if (activeUsers.length === 1) {
    questionStartsTime = Date.now();

    console.log(activeUsers);
    question = "what is -10 + 10";
    response = [];
    io.emit("question", questions);
    console.log("Question sent to all users:", question);
  }

  socket.on("answer", (data) => {
    const responseTime = Date.now();
    response.push({
      userId: socket.id,
      TimeTaken: responseTime,
      answer: data.answer,
    });
    console.log(response);

    if (response.length === 1) {
      const firstResponder = response.sort((a, b) => {
        return a.TimeTaken - b.TimeTaken;
      })[0];
      io.emit("result", {
        firstResponder: firstResponder.userId,
        answer: firstResponder.answer,
        TimeTaken: firstResponder.TimeTaken - questionStartsTime,
      });
      console.log("Winner:", firstResponder);
      question = null;
      response = [];
      questionStartsTime = null;
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers = activeUsers.filter((user) => user !== socket.id);
    console.log(activeUsers);
  });
});

app.get("/", (req, res) => {
  res.send("server is running perfectly");
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log("Server listening on http://localhost:3000");
});

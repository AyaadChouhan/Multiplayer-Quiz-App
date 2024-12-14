import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(express.json())
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

app.get('/greet', (req, res) => {
  res.json({ message: 'Hello, welcome to the Multiplayer Quiz Game API!' });
});

io.on("connection", (socket) => {
  if (activeUsers.length >= 3) {
    socket.emit("error", "No more users allowed!");
    socket.disconnect();
    return;
  }

  console.log("user connected", socket.id);
  activeUsers.push(socket.id);
  console.log(activeUsers.length);

  if (activeUsers.length === 3) {
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

    if (response.length === 3) {
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

const port = process.env.PORT;
server.listen(port, () => {
  console.log("Server listening on http://localhost:3000");
});

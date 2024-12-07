require('dotenv').config()
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const activeUsers = [];
const response = [];
const question = null;

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  activeUsers.push(socket.id);

  if (activeUsers.length === 2 && !question) {
    question = "what is -10 + 10";
    response = [];
    io.emit("question", question);
    console.log("Question sent to all users:", question);
  }

  socket.on("answer", (data) => {
    const responseTime = Date.now();
    response.push({
      userId: socket.id,
      answer: responseTime,
      answer: data.answer,
    });
  });

  if (response.length === 2) {
    const firstResponder = response.sort((a, b) => {
      return a.time - b.time;
    })[0];
    io.emit("result", {
      firstResponder: firstResponder.userId,
      answer: firstResponder.answer,
      responseTime: firstResponder.time - Date.now(),
    });
    console.log("Winner:", firstResponder);
    question = null;
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers = activeUsers.filter((user) => user !== socket.id);
  });

});

app.get('/', (req, res)=>{
res.send('server is running perfectly')
})

const port = process.env.PORT;
server.listen(port, () => {
  console.log("Server listening on http://localhost:3000");
});

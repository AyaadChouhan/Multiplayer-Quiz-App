/* eslint-disable no-unused-vars */
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
const socket = io('http://localhost:3000');
import "./App.css";
console.log(io)
console.log(socket)
function App() {
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    socket.on("question", (data) => {
      setQuestion(data);
      setResult(null);
    });

    socket.on("result", (data) => {
      setResult(data);
    });
    return () => socket.off();
  }, []);

  function SubmitFunc() {
    if (answer.trim()) {
      socket.emit("answer", { answer });
      setAnswer("");
    }
  }
  return (
    <>
      <div className="mainContainer">
        <h1>Real Time Quiz App</h1>
        {question ? (
          <div>
            <h2>{question}</h2>
            <input
              type="text"
              value="question"
              id="questionBox"
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button onClick={SubmitFunc}>submit</button>
          </div>
        ) : (
          <h2>Waiting for question...</h2>
        )}

        {result && (
          <div>
            <h3>Winner: {result.firstResponder}</h3>
            <p>Answer: {result.answer}</p>
            <p>Response Time: {result.responseTime} ms</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

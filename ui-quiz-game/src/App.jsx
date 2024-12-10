/* eslint-disable no-unused-vars */
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
const socket = io("http://localhost:3000");
import "./App.css";

function App() {
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    let i =  0
    socket.on("question", (data) => {
      setQuestion(data[i]);
      setResult(null);
    });

    socket.on("result", (data) => {
      setResult(data);
    });

    return () => {
      socket.off("question");
      socket.off("result");
    };
  }, []);

  function SubmitFunc() {
    let i = 0
    if (answer.trim()) {
      socket.emit("answer", { answer });
      setAnswer("");
      // i++
      setQuestion(null);
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
              value={answer}
              id="ansBox"
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
            <p>Response Time: {result.TimeTaken} ms</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

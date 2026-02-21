import logo from './logo.svg';
import './App.css';
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

const callBackend = async (payload) => {
  try {
    const res = await fetch("http://localhost:5001/api/instr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // convert here
    });

    const data = await res.json();
    setMessage(data.message);
  } catch (err) {
    console.error("Backend error:", err);
  }
};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>Lethbridge iGem</p>

        <button onClick={() =>
          callBackend({
          type: "Motor",
          board: 3,
          axis: "Y",
          compInstr: { steps: 1000, Direction: "up" }
          })
          }>
          Test backend - Up
        </button>

        <button onClick={() =>
          callBackend({
          type: "Motor",
          board: 3,
          axis: "Y",
          compInstr: { steps: 1000, Direction: "down" } //This could be binary 0:down etc
          })
          }>
          Test backend - Down
        </button>

        {message && <p>{message}</p>}

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

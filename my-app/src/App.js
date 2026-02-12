import logo from './logo.svg';
import './App.css';
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
    var jsonData = {
    "Instructions": [
        {
            "Type": "Motor", 
            "Axis": "X",
            "BoardNum": 1,
            "Val": 1000,
            "Dir": 1
        },
        {
            "Type": "Temp", 
            "BoardNum": 1,
            "Val": 1000,
            "Time": 50
        }
    ]
  }
  function handleClick() {
    fetch('http://localhost:5000/api/data', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>Lethbridge iGem</p>

        <button onClick={handleClick}>
          Test backend
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

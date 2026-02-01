import logo from './logo.svg';
import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  return (
    <div className="App">
      <header>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        OSAGE Control Interface
      </header>

      <Sidemenu isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
    </div>
  );
}

export default App;

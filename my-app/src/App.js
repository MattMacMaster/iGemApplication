import logo from './logo.svg';
import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function App() {
  return (
    <div className="App">
      <Sidemenu />
    </div>
  );
}

export default App;

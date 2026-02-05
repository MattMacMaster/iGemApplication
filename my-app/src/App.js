import logo from './logo.svg';
import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeId = useRef(0);

  // need these 3 basic ones for sure, look for more later if need more functionality 
  const onNodesChange = useCallback((changes) => setNodes ((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  /*
  const newNode = {
    id: 'hardware-${nodeID.current++}',
    data: { label: parsedData.label },
    position,
    type: 'default',
  }
  */

  return (
    <div className="App">
      <header>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        OSAGE Control Interface
      </header>

      <Sidemenu isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

    <div style = {{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
    </div>
  );
}

export default App;

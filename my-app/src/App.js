import logo from './logo.svg';
import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback, useRef, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThermometerNode from './Components/HardwareNodes/ThermometerNode';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeId = useRef(0);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSystemPanel, setShowSystemPanel] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      thermometer: ThermometerNode,
    }),
    []
  );

  // need these 3 basic ones for sure, look for more later if need more functionality 
  const onNodesChange = useCallback((changes) => setNodes ((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  const onResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    nodeId.current = 0;
  }, []);

  // from HTML Drag and Drop API
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // from HTML Drag and Drop API too
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newId = `node-${nodeId.current++}`;

      setNodes((nds) =>
        nds.concat({
          id: newId,
          type: parsed.type ?? 'default',
          position,
          data: { 
            label: parsed.label ?? 'Node',
            settings: parsed.settings ?? {}
          },
        })
      );
    },
    [reactFlowInstance]
  );

  const isValidConnection = useCallback((connection) => {
    const sourceKey = (v) => v ?? null;
    const hasConnection = edges.some(
      (edge) =>
        edge.source === connection.source &&
        sourceKey(edge.sourceHandle) === sourceKey(connection.sourceHandle)
    );
    return !hasConnection;
  }, [edges]);

  return (
    <div className="App">
      <header>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        OSAGE Control Interface
        <button 
          onClick={() => setShowSystemPanel(!showSystemPanel)}
          style={{ marginLeft: '20px', padding: '5px 10px' }}
        >
          {showSystemPanel ? 'Hide System Panel' : 'Show System Panel'}
        </button>
      </header>

      <Sidemenu
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onResetCanvas={onResetCanvas}
      />

      {showSystemPanel && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#0f0',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '400px',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxHeight: '60vh',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'rgb(255, 255, 255)' }}>System Panel</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Components ({nodes.length}):</strong>
            {nodes.map(item => (
              <li key={item.id}> {
                item.data.label}
              </li>))}
          </div>
          <div>
            <strong>Connections ({edges.length}):</strong>
            {edges.map(item => (
              <li key={item.id}>
                {item.source} to {item.target}
              </li>
            ))}
          </div>
        </div>
      )}

    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        isValidConnection={isValidConnection}
        fitView
      >
        <Background />
        <Controls position= 'top-right'/>
      </ReactFlow>
    </div>
    </div>
  );
}

export default App;


/*
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
          */
import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback, useRef, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThermometerNode from './Components/HardwareNodes/ThermometerNode';
import SyringePumpNode from './Components/HardwareNodes/SyringePumpNode';
import ElectroporatorNode from './Components/HardwareNodes/ElectroporatorNode';
import PeristalticPumpNode from './Components/HardwareNodes/PeristalticPumpNode';
import SpectrometerNode from './Components/HardwareNodes/SpectrometerNode';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeId = useRef(0);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSystemPanel, setShowSystemPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [savedCycles, setSavedCycles] = useState([]);

  const updateNodeSettings = useCallback((id, update) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const prevSettings = n.data?.settings ?? {};
        return {
          ...n,
          data: {
            ...(n.data ?? {}),
            settings: { ...prevSettings, ...(update ?? {}) },
          },
        };
      })
    );
  }, []);

  const nodeTypes = useMemo(
    () => ({
      thermometer: ThermometerNode,
      syringePump: SyringePumpNode,
      spectrometer: SpectrometerNode,
      electroporator: ElectroporatorNode,
      peristalticPump: PeristalticPumpNode,
    }),
    []
  );

  // need these 3 basic ones for sure, look for more later if need more functionality 
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  const handleOpenLoadMenu = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/cycles');
      if (res.ok) {
        const data = await res.json();
        setSavedCycles(data);
        setShowLoadMenu(true);
      }
    } catch (e) {
      console.error("Failed to load cycles", e);
      alert("Failed to connect to backend");
    }
  }, []);

  const handleLoadCycle = useCallback(async (id) => {
    try {
      const res = await fetch('http://localhost:5001/api/cycles/${id}');
      if (res.ok) {
        const { nodes : loadedNodes, edges: loadedEdges} = await res.json();
        
        const nodesWithCallbacks = loadedNodes.map(n => ({
          ...n,
          data: {
            ...n.data,
            onSettingsChange: (update) => updateNodeSettings(n.id, update)
          }
        }));
        
        setNodes(nodesWithCallbacks);
        setEdges(loadedEdges);
        setShowLoadMenu(false);
      }
    } catch (e) {
      console.error("Failed to load cycle", e);
      alert("Failed to connect to backend");
    }
  }, []);
    

  const onSaveCycle = useCallback(async () => {
    const name = window.prompt('Name this cycle:');
    if (!name) return;

    try {
      const res = await fetch('http://localhost:5001/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nodes, edges }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Save failed:', err);
        alert('Failed to save cycle.');
        return;
      }

      const data = await res.json();
      console.log('Saved cycle with id:', data.id);
      alert('Cycle saved!');
    } catch (e) {
      console.error('Save error:', e);
      alert('Error saving cycle.');
    }
  }, [nodes]);

  const onResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    nodeId.current = 0;
  }, []);

  const onToggleDarkMode = useCallback(() => {
    const el = document.documentElement;
    if (el.getAttribute('data-theme') === 'dark') {
      el.removeAttribute('data-theme');
      setIsDarkMode(false);
    } else {
      el.setAttribute('data-theme', 'dark');
      setIsDarkMode(true);
    }
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
            settings: parsed.settings ?? {},
            onSettingsChange: (update) => updateNodeSettings(newId, update),
          },
        })
      );
    },
    [reactFlowInstance, updateNodeSettings]
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
      <header className="app-header">
        <div className="app-header__left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">☰</button>
          <h1 className="app-header__title">MOSMAGE Control Interface</h1>
        </div>
        <div className="app-header__actions">
          <button
            className="btn-secondary"
            onClick={() => setShowSystemPanel(!showSystemPanel)}
          >
            {showSystemPanel ? 'Hide System Panel' : 'System Panel'}
          </button>
        </div>
      </header>

      <Sidemenu
        isOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onResetCanvas={onResetCanvas}
        onToggleDarkMode={onToggleDarkMode}
        isDarkMode={isDarkMode}
        onSaveCycle={onSaveCycle}
      />

      {/* write da load menu here */}

      {showSystemPanel && (
        <div className="system-panel">
          <h3 className="system-panel__title">System Panel</h3>
          <div className="system-panel__section">
            <div className="system-panel__section-title">Components ({nodes.length})</div>
            <ul>
              {nodes.map(item => (
                <li key={item.id}>{item.data.label}</li>
              ))}
            </ul>
          </div>
          <div className="system-panel__section">
            <div className="system-panel__section-title">Connections ({edges.length})</div>
            <ul>
              {edges.map(item => (
                <li key={item.id}>{item.source} → {item.target}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="app-canvas-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            animated: true
          }}
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
          <Controls position='top-right' />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;

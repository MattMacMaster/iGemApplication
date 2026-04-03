
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

  // popup useStates. i believe this is all we need for the popups.
  const [showSaveNameCycle, setShowSaveNameCycle] = useState(false);
  const [saveCycleName, setSaveCycleName] = useState('');
  const [saveCycleError, setSaveCycleError] = useState(null);
  const [showCycleSavedSuccess, setShowCycleSavedSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /**
   * Updates a node's settings when its inputs are changed (like steps, axis, direction)
   */
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

  /**
   * Fetches all saved cycles and opens the Load menu.
   */
  const handleOpenLoadMenu = useCallback(async () => {
    setShowLoadMenu(true);
    try {
      const res = await fetch('http://localhost:5001/api/cycles');
      if (!res.ok) {
        // Keep UI stable even if backend responds with an error.
        setSavedCycles([]);
        return;
      }

      const data = await res.json();
      setSavedCycles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load error:', e);
      alert('Failed to load cycles.');
      setSavedCycles([]);
    }
  }, []);

  /**
   * Loads one saved cycle by id and places it back on the canvas.
   * onSettingsChange is reattached because functions aren't stored in DB JSON.
   */
  const handleLoadCycle = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/cycles/${id}`);
      if (!res.ok) {
        alert('Failed to load cycle.');
        return;
      }
      const data = await res.json();
      setNodes(
        data.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onSettingsChange: (update) => updateNodeSettings(node.id, update),
          },
        }))
      );
      // Replace current canvas graph with the loaded one.
      setEdges(data.edges);
      setShowLoadMenu(false);
    } catch (e) {
      console.error('Failed to load cycle:', e);
      alert('Failed to load cycle.');
    }
  }, [updateNodeSettings]);

  /**
   * Deletes a saved cycle by id.
   */
  const deleteCycle = useCallback(async (cycleId) => {
    if (!window.confirm("Are you sure you want to delete this cycle?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/cycles/${cycleId}`, {
        method: 'DELETE',
      });

      if (!res.ok) return;

      // Refresh list from DB so menu always reflects server truth.
      const listRes = await fetch('http://localhost:5001/api/cycles');
      if (listRes.ok) {
        const data = await listRes.json();
        setSavedCycles(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete cycle.');
    }
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

  /**
   * Saves the current canvas graph as a new cycle.
   */
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
      alert('Cycle saved');
    } catch (e) {
      console.error('Save error:', e);
      alert('Error saving cycle.');
    }
  }, [nodes, edges]);

  /**
   * Resets the canvas.
   */
  const onResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    nodeId.current = 0;
  }, []);

  /**
   * Toggles the dark mode.
   */
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

  /**
   * Handles drag over events.
   * Drom the HTML Drag and Drop API.
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handles drop events.
   * From the HTML Drag and Drop API.
   */
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

  /**
   * Checks if a connection is valid (no duplicate connections).
   */
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
        onOpenLoadMenu={handleOpenLoadMenu}
      />

      {showLoadMenu && (
        <div className="loadmenu-overlay" role="dialog" aria-modal="true" aria-labelledby="loadmenu-title">
          <div className="loadmenu">
            <div className="loadmenu__header">
              <div id="loadmenu-title" className="loadmenu__title">
                Load cycle
              </div>
              <button type="button" className="btn-secondary" onClick={() => setShowLoadMenu(false)}>
                Close
              </button>
            </div>
            <div className="loadmenu__body">
              {savedCycles.length === 0 ? (
                <p className="loadmenu__empty">No saved cycles found.</p>
              ) : (
                <ul className="loadmenu__list">
                  {savedCycles.map((cycle) => (
                    <li key={cycle.id} className="loadmenu__row">
                      <button
                        type="button"
                        className="loadmenu__item-btn"
                        onClick={() => handleLoadCycle(cycle.id)}
                      >
                        <span className="loadmenu__item-name">{cycle.name}</span>
                      </button>
                      <button
                        type="button"
                        className="loadmenu__delete-btn"
                        title="Delete this cycle"
                        onClick={() => deleteCycle(cycle.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

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

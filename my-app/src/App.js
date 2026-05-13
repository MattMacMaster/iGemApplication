import './styles/App.css';
import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import LoadCycleDialog from './Components/LoadCycleDialog';
import ThermometerNode from './Components/HardwareNodes/ThermometerNode';
import SyringePumpNode from './Components/HardwareNodes/SyringePumpNode';
import ElectroporatorNode from './Components/HardwareNodes/ElectroporatorNode';
import PeristalticPumpNode from './Components/HardwareNodes/PeristalticPumpNode';
import SpectrometerNode from './Components/HardwareNodes/SpectrometerNode';
import Sidemenu from './Components/SideMenu/Sidemenu';

import { useCycleSave } from './hooks/useCycleSave';
import { useCycleLoader } from './hooks/useCycleLoader';
import { useCycleDelete } from './hooks/useCycleDelete';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const nodeId = useRef(0);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [showSystemPanel, setShowSystemPanel] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );

  /**
   * Updates node settings.
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
            settings: {
              ...prevSettings,
              ...(update ?? {}),
            },
          },
        };
      })
    );
  }, []);

  /**
   * Cycle loading hook.
   */
  const {
    showLoadMenu,
    setShowLoadMenu,
    savedCycles,
    setSavedCycles,
    activeCycleId,
    setActiveCycleId,
    activeCycleName,
    setActiveCycleName,
    handleOpenLoadMenu,
    handleLoadCycle,
  } = useCycleLoader({
    setNodes,
    setEdges,
    updateNodeSettings,
  });

  /**
   * Cycle delete hook.
   */
  const { deleteCycle } = useCycleDelete({
    setSavedCycles,
  });

  /**
   * Cycle save hook.
   */
const { onSaveCycle, onSaveAsNew } = useCycleSave({
  nodes,
  edges,
  activeCycleId,
  activeCycleName,
  setActiveCycleId,
  setActiveCycleName,
});

  /**
   * Node types.
   */
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

  /**
   * ReactFlow handlers.
   */
  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge(connection, eds)),
    []
  );

  /**
   * Resets canvas.
   */
  const onResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);

    nodeId.current = 0;

    setActiveCycleId(null);
    setActiveCycleName('');
  }, [setActiveCycleId, setActiveCycleName]);

  /**
   * Toggles dark mode.
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
   * Handles drag over.
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handles node drop.
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const raw = event.dataTransfer.getData(
        'application/reactflow'
      );

      if (!raw) return;

      let parsed;

      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }

      const position =
        reactFlowInstance.screenToFlowPosition({
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
            onSettingsChange: (update) =>
              updateNodeSettings(newId, update),
          },
        })
      );
    },
    [reactFlowInstance, updateNodeSettings]
  );

  /**
   * Prevent duplicate source connections.
   */
  const isValidConnection = useCallback(
    (connection) => {
      const sourceKey = (v) => v ?? null;

      const hasConnection = edges.some(
        (edge) =>
          edge.source === connection.source &&
          sourceKey(edge.sourceHandle) ===
            sourceKey(connection.sourceHandle)
      );

      return !hasConnection;
    },
    [edges]
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="app-header__left">
          <button
            className="menu-toggle"
            onClick={() =>
              setIsMenuOpen(!isMenuOpen)
            }
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <h1 className="app-header__title">
            MOSMAGE Control Interface
          </h1>
        </div>

        <div className="app-header__actions">
          <button
            className="btn-secondary"
            onClick={() =>
              setShowSystemPanel(!showSystemPanel)
            }
          >
            {showSystemPanel
              ? 'Hide System Panel'
              : 'System Panel'}
          </button>
        </div>
      </header>

      <Sidemenu
        isOpen={isMenuOpen}
        toggleMenu={() =>
          setIsMenuOpen(!isMenuOpen)
        }
        onResetCanvas={onResetCanvas}
        onToggleDarkMode={onToggleDarkMode}
        isDarkMode={isDarkMode}
        onSaveCycle={onSaveCycle}
        onSaveAsNew={onSaveAsNew}
        activeCycleName={activeCycleName}
        onOpenLoadMenu={handleOpenLoadMenu}
      />

      <LoadCycleDialog
        open={showLoadMenu}
        cycles={savedCycles}
        onClose={() => setShowLoadMenu(false)}
        onLoad={handleLoadCycle}
        onDelete={deleteCycle}
      />

      {showSystemPanel && (
        <div className="system-panel">
          <h3 className="system-panel__title">
            System Panel
          </h3>

          <div className="system-panel__section">
            <div className="system-panel__section-title">
              Components ({nodes.length})
            </div>

            <ul>
              {nodes.map((item) => (
                <li key={item.id}>
                  {item.data.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="system-panel__section">
            <div className="system-panel__section-title">
              Connections ({edges.length})
            </div>

            <ul>
              {edges.map((item) => (
                <li key={item.id}>
                  {item.source} → {item.target}
                </li>
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
            animated: true,
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
          <Controls position="top-right" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
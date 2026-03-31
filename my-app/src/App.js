import './App.css';
import Sidemenu from './Components/Sidemenu';
import { useState, useCallback, useRef, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThermometerNode from './Components/HardwareNodes/ThermometerNode';
import SyringePumpNode from './Components/HardwareNodes/SyringePumpNode';

// Finds all nodes reachable from a starting node (undirected BFS)
function getConnectedComponent(startId, allIds, edges) {
  const adj = Object.fromEntries(allIds.map((id) => [id, []]));
  for (const edge of edges) {
    if (adj[edge.source]) adj[edge.source].push(edge.target);
    if (adj[edge.target]) adj[edge.target].push(edge.source); // undirected
  }

  const visited = new Set();
  const queue = [startId];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const neighbor of adj[cur] ?? []) queue.push(neighbor);
  }
  return visited;
}

// Validates a group and returns a topologically sorted order, or throws with a message
function validateAndSortGroup(groupIds, edges) {
  // Filter edges to only those within the group
  const groupSet = new Set(groupIds);
  const groupEdges = edges.filter((e) => groupSet.has(e.source) && groupSet.has(e.target));

  // Count outgoing edges per node
  const outDegree = Object.fromEntries(groupIds.map((id) => [id, 0]));
  const inDegree  = Object.fromEntries(groupIds.map((id) => [id, 0]));
  const adj       = Object.fromEntries(groupIds.map((id) => [id, []]));

  for (const edge of groupEdges) {
    outDegree[edge.source]++;
    inDegree[edge.target]++;
    adj[edge.source].push(edge.target);
  }

  // Validate: exactly 1 output node (node with outDegree === 0)
  const outputNodes = groupIds.filter((id) => outDegree[id] === 0);
  if (outputNodes.length === 0) {
    throw new Error('Invalid group: no output node found (possible cycle with no tail).');
  }
  if (outputNodes.length > 1) {
    throw new Error(`Invalid group: ${outputNodes.length} output nodes found — there must be exactly 1.`);
  }

  // Topological sort (Kahn's algorithm)
  const queue = groupIds.filter((id) => inDegree[id] === 0);
  const order = [];
  const inDeg = { ...inDegree };

  while (queue.length > 0) {
    const cur = queue.shift();
    order.push(cur);
    for (const neighbor of adj[cur]) {
      inDeg[neighbor]--;
      if (inDeg[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (order.length !== groupIds.length) {
    throw new Error('Invalid group: contains a cycle.');
  }

  return order;
}

async function sendNodeInstruction(node) {
  const settings = node.data.settings ?? {};
  const res = await fetch('http://localhost:5001/api/instr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodeId: node.id,
      nodeType: node.type,
      label: node.data.label,
      settings,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error on ${node.data.label}: ${text}`);
  }
  return res.json();
}

const DELAY_MS = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeId = useRef(0);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSystemPanel, setShowSystemPanel] = useState(false);
  const [isRunning, setIsRunning]     = useState(false);
  const [runProgress, setRunProgress] = useState(null);

  const nodeTypes = useMemo(
    () => ({
      thermometer: ThermometerNode,
      syringePump: SyringePumpNode,
    }),
    []
  );

  const makeOnSettingsChange = useCallback((id) => (newSettings) => {
  setNodes((nds) =>
    nds.map((n) =>
      n.id === id
        ? { ...n, data: { ...n.data, settings: { ...n.data.settings, ...newSettings } } }
        : n
    )
  );
}, []);

  // need these 3 basic ones for sure, look for more later if need more functionality 
  const onNodesChange = useCallback((changes) => setNodes ((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);

  const onResetCanvas = useCallback(() => {
    if (isRunning) return;
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
            settings: parsed.settings ?? {},
            runStatus: 'idle',
            errorMsg: null,
            isLocked: false,
            onSettingsChange: makeOnSettingsChange(newId),
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

const onSendAll = useCallback(async () => {
    if (isRunning || nodes.length === 0) return;

    let currentNodes, currentEdges;
    setNodes((nds) => { currentNodes = nds; return nds; });
    setEdges((eds) => { currentEdges = eds; return eds; });
    await sleep(0);

   const allIds = currentNodes.map((n) => n.id);
const hasEdge = new Set([
  ...currentEdges.map((e) => e.source),
  ...currentEdges.map((e) => e.target),
]);

const seed = allIds.find((id) => hasEdge.has(id));
if (!seed) {
  alert('No connected nodes found. Connect at least 2 nodes to form a group.');
  return;
}

const componentIds = [...getConnectedComponent(seed, allIds, currentEdges)];

let order;
try {
  order = validateAndSortGroup(componentIds, currentEdges);
} catch (err) {
  alert(err.message);
  return;
}

    const total = order.length;
    setIsRunning(true);
    setRunProgress({ current: 0, total });

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        draggable: false,
        data: { ...n.data, runStatus: 'pending', errorMsg: null},
      }))
    );

    for (let i = 0; i < order.length; i++) {
      const id = order[i];

      setNodes((nds) =>
        nds.map((n) => n.id === id ? { ...n, data: { ...n.data, runStatus: 'running' } } : n)
      );
      setRunProgress({
        current: i + 1,
        total,
        label: targetNode.data.label,
        board: targetNode.data.settings?.boardVal ?? '?',
});
      let targetNode;
      setNodes((nds) => { targetNode = nds.find((n) => n.id === id); return nds; });
      await sleep(0);

      try {
        await sendNodeInstruction(targetNode);
        setNodes((nds) =>
          nds.map((n) => n.id === id ? { ...n, data: { ...n.data, runStatus: 'done' } } : n)
        );
      } catch (err) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, runStatus: 'failed', errorMsg: err.message } }
              : n
          )
        );
        setIsRunning(false);
        setRunProgress(null);
        return;
      }

      if (i < order.length - 1) await sleep(DELAY_MS);
    }

    setIsRunning(false);
    setRunProgress(null);
  }, [isRunning, nodes.length]);

  return (
    <div className="App">
      <header>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        OSAGE Control Interface

        <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className={`send-all-btn ${isRunning ? 'send-all-btn--running' : ''}`}
            onClick={onSendAll}
            disabled={isRunning || nodes.length === 0}
          >
            {isRunning ? '⟳  Running…' : '▶  Send All'}
          </button>
          {runProgress && (
            <div className="run-progress">
              <div className="run-progress-bar">
                <div
                  className="run-progress-fill"
                  style={{ width: `${(runProgress.current / runProgress.total) * 100}%` }}
                />
              </div>
              <span className="run-progress-label">
                {runProgress.current} / {runProgress.total} | Current: {runProgress.label}, Board: {runProgress.board}
              </span>
              <button onClick={() => {
                setIsRunning(false);
                setRunProgress(null);
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>

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
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={!isRunning}
        panOnDrag={!isRunning}
        zoomOnScroll={!isRunning}
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

const express = require("express");
const cors = require("cors");
// const i2c = require("i2c-bus");
// const { Gpio } = require("onoff");
const db = require("./database");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

/*
// Open I2C bus (bus 1 on Raspberry Pi)
const bus = i2c.openSync(1);
const SLAVE_ADDRESS = 0x04;
const TCA_ADDRESS = 0x70;  // I2C multiplexer

// Open to change
// Define GPIO pins
// NOTE: It seems that Raspberry OS kernel addresses GPIO pins yet by another numbering scheme.
// cat /sys/kernel/debug/gpio
// these originally were 17,27,22 for pi3, Changes in PI will break here
const pins = [
  new Gpio(588, "out"),
  new Gpio(598, "out"),
  new Gpio(593, "out"),
];

// Helper function: convert number to 3-bit array
function to3BitArray(num) {
  return [
    (num >> 2) & 1,
    (num >> 1) & 1,
    num & 1,
  ];
}

// Write bits to pins
function writeBits(bits) {
  bits.forEach((bit, i) => {
    pins[i].writeSync(bit);
  });
}

app.post("/api/instr", (req, res) => {
  const { axis, compInstr, board } = req.body;

  const direction = compInstr?.Direction?.toLowerCase();
  const distance = compInstr?.steps;

  // Validate axis
  if (!["X", "Y", "Z", "A"].includes(axis)) {
    return res.status(400).json({ error: "Invalid axis" });
  }

  // Validate direction
  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({ error: "Invalid direction" });
  }

  // Validate board
  if (!Number.isInteger(board) || board < 0 || board > 7) {
    return res.status(400).json({ error: "Board must be integer 0–7" });
  }

  const bits = to3BitArray(board);
  writeBits(bits);

  const message = `${axis} ${direction} ${distance}`;

  // Convert string to byte array (same as Python ord())
  const bytes = Buffer.from(message, "utf-8");

  try {
    bus.writeByteSync(TCA_ADDRESS, 0x00, 1 << board); //Channel select


    bus.writeI2cBlockSync(
      SLAVE_ADDRESS,
      0x00, // command byte (same as Python)
      bytes.length,
      bytes
    );

    console.log("Sent:", message);
    res.json({ message: "Command sent to Arduino" });

  } catch (err) {
    console.error("I2C Error:", err);
    res.status(500).json({ error: "I2C failed" });
  }
});
*/

// Saves a cycle
app.post("/api/cycles", (req, res) => {
  const { name, nodes, edges } = req.body;

  if (!name || !Array.isArray(nodes)) {
    return res.status(400).json({ error: "Name and nodes[] required" });
  }

  const cycleStmt = db.prepare(`
    INSERT INTO cycles (name)
    VALUES (?)
  `);

  const result = cycleStmt.run(name);
  const cycleId = result.lastInsertRowid;

  const nodeStmt = db.prepare(`
    INSERT INTO nodes (cycleId, flowId, nodeType, positionX, positionY, jsonData)
    VALUES (@cycleId, @flowId, @nodeType, @positionX, @positionY, @jsonData)
  `);

  const edgeStmt = db.prepare(`
    INSERT INTO edges (cycleId, flowId, source, target)
    VALUES (@cycleId, @flowId, @source, @target)
  `);

  const insertMany = db.transaction((nodesIn, edgesIn) => {
    const safeNodes = Array.isArray(nodesIn) ? nodesIn : [];
    const safeEdges = Array.isArray(edgesIn) ? edgesIn : [];

    // insert nodes
    for (const node of safeNodes) {
      nodeStmt.run({
        cycleId,
        flowId: node.id,
        nodeType: node.type ?? null,
        positionX: node.position?.x ?? 0,
        positionY: node.position?.y ?? 0,
        jsonData: JSON.stringify(node.data ?? {}),
      });
    }

    // insert edges
    for (const edge of safeEdges) {
      edgeStmt.run({
        cycleId,
        flowId: edge.id,
        source: edge.source,
        target: edge.target,
      });
    }
  });

  insertMany(nodes, edges);

  res.status(201).json({ id: cycleId });
});

// Retrieves all cycles
app.get("/api/cycles", (req, res) => {
  const stmt = db.prepare(`
    SELECT id, name FROM cycles
    ORDER BY name
  `);

  const rows = stmt.all();
  res.json(rows);
});

// Retrieve a single cycle
app.get("/api/cycles/:id", (req, res) => {
  const { id } = req.params;

  try {
    const nodesStmt = db.prepare(`SELECT * FROM nodes WHERE cycleId = ?`);
    const edgesStmt = db.prepare(`SELECT * FROM edges WHERE cycleId = ?`);

    const nodes = nodesStmt.all(id);
    const edges = edgesStmt.all(id);

    // Format nodes
    const formattedNodes = nodes.map(n => ({
      id: n.flowId,
      type: n.nodeType,
      position: { x: n.positionX, y: n.positionY },
      data: JSON.parse(n.jsonData)
    }));

    // Format edges
    const formattedEdges = edges.map(e => ({
      id: e.flowId,
      source: e.source,
      target: e.target
    }));

    res.json({ nodes: formattedNodes, edges: formattedEdges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load cycle" });
  }
});

// Let user delete a saved cycle
app.delete("/api/cycles/:id", (req, res) => {
  const result = db.prepare(` DELETE FROM cycles WHERE id = ? `).run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Cycle not found" });
  }
  res.json({ message: "Cycle deleted" })
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

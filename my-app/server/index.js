const express = require("express");
const cors = require("cors");
const i2c = require("i2c-bus");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Open I2C bus (bus 1 on Raspberry Pi)
const bus = i2c.openSync(1);
const SLAVE_ADDRESS = 0x04;

app.post("/api/instr", (req, res) => {
  const { axis, compInstr } = req.body;

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
  const message = `${axis} ${direction} ${distance}`;

  // Convert string to byte array (same as Python ord())
  const bytes = Buffer.from(message, "utf-8");

  try {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

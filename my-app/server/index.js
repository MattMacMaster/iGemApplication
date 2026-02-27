
const express = require("express");
const cors = require("cors");
const i2c = require("i2c-bus");
const { Gpio } = require("onoff");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

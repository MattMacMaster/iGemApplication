const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/instr", (req, res) => {
  const { type, board, axis, compInstr } = req.body;

  console.log("Type:", type);
  console.log("Board:", board);
  console.log("Axis:", axis);
  console.log("Computer Instructions:", compInstr);

  res.json({ message: "Instructions received!" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

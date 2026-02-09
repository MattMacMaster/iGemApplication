const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());          // 👈 ADD THIS
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Node backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

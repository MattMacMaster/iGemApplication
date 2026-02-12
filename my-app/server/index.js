const express = require("express");
const cors = require("cors");

const app = express(), bodyParser = require('body-parser');
const PORT = 5000;

app.use(cors());
app.use(express.json());


app.post('/api/data', function(req, res) {
    console.log('receiving data ...');
    console.log(req.body); //Json
    res.json({ message: "Data received" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

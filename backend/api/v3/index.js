const { Router } = require("express");
const b = require("./b");

const v3 = Router();

v3.use("/b", b);
v3.use("*", (req, res) => {
  res.status(404);
  res.send({ "message": "Bin not found" });
});

module.exports = v3
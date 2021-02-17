const idCheck = (req, res, next) => {
  const { id } = req.params;

  if (id.length !== 13 || /\D/i.test(id)) {
    res.status(400);
    res.send({ "message": "Invalid Bin Id provided" });
  }

  next();
};

const blankBinCheck = (req, res, next) => {
  const bin = req.body;
    if (Object.keys(bin).length === 0) {
        res.status(400);
        res.send({ "message": "Bin cannot be blank" }); 
    }

  next();
};

module.exports = { idCheck: idCheck, blankBinCheck: blankBinCheck };
const idCheck = (req, res, next) => {
  const { id } = req.params;

  if (id.length !== 13 || /\D/i.test(id)) {
    res.status(400);
    res.send({ "message": "Invalid Bin Id provided" });
  }

  next();
};

module.exports = idCheck;
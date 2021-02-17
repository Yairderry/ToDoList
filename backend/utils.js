const fs = require('fs');

// id is the Date.getTime method that returns a 13 digit number, anything else is invalid id
const idCheck = (req, res, next) => {
  const { id } = req.params;

  if (id.length !== 13 || /\D/i.test(id)) {
    res.status(400);
    res.send({ "message": "Invalid Bin Id provided" });
  }

  next();
};

// JSONbin does not allow to create an emtpy bin
const blankBinCheck = (req, res, next) => {
  const bin = req.body;
    if (Object.keys(bin).length === 0) {
        res.status(400);
        res.send({ "message": "Bin cannot be blank" }); 
    }

  next();
};

// checking if a certain bin exist in database
const binCheck = (req, res, next) => {
  const { id } = req.params;
  let userBins = fs.readdirSync('./backend/bins');

  for(let i = 0; i < userBins.length; i++) {
    if(userBins[i] === `${id}.JSON`) {
      next();
    }
  }

  res.status(404);
  res.send({ "message": "Bin not found" });
};

module.exports = { idCheck: idCheck, blankBinCheck: blankBinCheck, binCheck: binCheck };
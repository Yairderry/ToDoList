const express = require('express');
const fs = require('fs');
const middleware = require("../../utils");

const router = express.Router();
router.use(express.json());
router.use(middleware.delay);

// init list of all bins for get, put and delete methods
let userBins = [];
fs.readdirSync('./backend/bins').forEach(file => {
    const bin = JSON.parse(fs.readFileSync(`./backend/bins/${file}`, { encoding:'utf8', flag:'r' }));
    const id = file.replace('.JSON', '');
    // each object in the array is formatted with id for easy access
    const binData = {bin, id};
    userBins.push(binData);
});

// get method for all the bins
router.get('/', (req, res) => {
    res.send({ "record": userBins });
});

// get method to read a specific bin
// middlewares are checking for valid id and existing bin
router.get('/:id',middleware.idCheck, middleware.binCheck , (req, res) => {
    const id = req.params.id;
    const data = fs.readFileSync(`./backend/bins/${id}.JSON`, 
            {encoding:'utf8', flag:'r'});
            res.send({ "record": JSON.parse(data), "metadata": { "id": id }});
});

// post method to create a new bin
// middlewares are checking if bin has content
router.post('/', middleware.blankBinCheck, (req, res) => {
    const bin = req.body;
    const id = new Date().getTime();
    userBins.push({ bin, id });
    fs.writeFileSync(`./backend/bins/${id}.JSON`, JSON.stringify(bin));
    res.send({ "record": bin, "metadata": { "id": id }});
});

// gut method to update a specific bin
// middlewares are checking for valid id and existing bin
router.put('/:id',middleware.idCheck, middleware.binCheck ,(req, res) => {
    const id = req.params.id;
    for(let i = 0; i < userBins.length; i++) {
        if(userBins[i].id === id) {
            userBins[i].bin = req.body;
            fs.writeFileSync(`./backend/bins/${id}.JSON`, JSON.stringify(req.body));
            res.send({ "record": req.body, "metadata": { "id": id }});
        }
    }
});

// delete method to remove a specific bin
// middlewares are checking for valid id and existing bin
router.delete('/:id',middleware.idCheck, middleware.binCheck ,(req, res) => {
    const id = req.params.id;
    for(let i = 0; i < userBins.length; i++) {
        if(userBins[i].id === id) {
            fs.unlinkSync(`./backend/bins/${userBins[i].id}.JSON`);
            userBins.splice(i, 1);
            res.send({ "message": "Bin deleted successfully" });
        }
    }
});

module.exports = router;
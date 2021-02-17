const express = require('express');
const fs = require('fs');
const router = express.Router();
router.use(express.json());

let userBins = [];
fs.readdirSync('./backend/bins').forEach(file => {
    file = fs.readFileSync(`./backend/bins/${file}`, { encoding:'utf8', flag:'r' });
    file = JSON.parse(file);
    userBins.push(file);
});

router.get('/', (req, res) => {
    res.send({ "record": userBins });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const data = fs.readFileSync(`./backend/bins/${id}.JSON`, 
            {encoding:'utf8', flag:'r'});
    res.send({ "record": JSON.parse(data), "metadata": { "id": id }});
});

router.post('/',(req, res) => {
    userBins.push(req.body);
    fs.writeFileSync(`./backend/bins/${req.body.id}.JSON`, JSON.stringify(req.body));
    res.send({ "record": req.body, "metadata": { "id": req.body.id }});
});

router.put('/:id',(req, res) => {
    const id = req.params.id;
    for(let i = 0; i < userBins.length; i++) {
        if(userBins[i].id === id) {
            userBins[i] = req.body;
            fs.writeFileSync(`./backend/bins/${id}.JSON`, JSON.stringify(req.body));
            res.send({ "record": req.body, "metadata": { "id": id }});
        }
    }
});

router.delete('/:id',(req, res) => {
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
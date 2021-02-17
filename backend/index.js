// const express = require('express');
// const fs = require('fs');
// const app = express();
// app.use(express.json());

// let userBins = [];
// fs.readdirSync('./backend/bins').forEach(file => {
//     file = fs.readFileSync(`./backend/bins/${file}`, { encoding:'utf8', flag:'r' });
//     file = JSON.parse(file);
//     userBins.push(file);
// });

// app.get('/b', (req, res) => {
//     res.send({ "record": userBins });
// });

// app.get('/b/:id', (req, res) => {
//     const id = req.params.id;
//     const data = fs.readFileSync('./backend/bins/' + id + '.JSON', 
//             {encoding:'utf8', flag:'r'});
//     res.send({ "record": JSON.parse(data), "metadata": { "id": id }});
// });

// app.post('/b',(req, res) => {
//     userBins.push(req.body);
//     fs.writeFileSync(`./backend/bins/${req.body.id}.JSON`, JSON.stringify(req.body));
//     res.send({ "record": req.body, "metadata": { "id": req.body.id }});
// });

// app.put('/b/:id',(req, res)=>{
//     const id = req.params.id;
//     for(let i = 0; i < userBins.length; i++) {
//         if(userBins[i].id === id) {
//             userBins[i] = req.body;
//             fs.writeFileSync(`./backend/bins/${id}.JSON`, JSON.stringify(req.body));
//             res.send({ "record": req.body, "metadata": { "id": id }});
//         }
//     }
// });

// app.delete('/b/:id',(req, res)=>{
//     const id = req.params.id;
//     for(let i = 0; i < userBins.length; i++) {
//         if(userBins[i].id === id) {
//             fs.unlinkSync(`./backend/bins/${userBins[i].id}.JSON`);
//             userBins.splice(i, 1);
//             res.send({ "message": "Bin deleted successfully" });
//         }
//     }
// });
const app = require("./app");
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`app listening on port: ${PORT}`);
});
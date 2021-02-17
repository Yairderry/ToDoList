const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const userBins = JSON.parse(fs.readFileSync('./backend/userBins.JSON', {encoding:'utf8', flag:'r'}));

app.get('/b', (req, res)=>{
    res.send(JSON.stringify(userBins, null, 4))
});

app.get('/b/:id', (req, res)=>{
    const id = req.params.id;
    const data = fs.readFileSync('./backend/' + id + '.JSON', 
            {encoding:'utf8', flag:'r'});
    res.send(data);
});

app.post('/b',(req, res)=>{
    userBins.push(req.body);
    fs.writeFileSync("./backend/userBins.JSON", JSON.stringify(userBins, null, 4));
    fs.writeFileSync(`./backend/${req.body.id}.JSON`, JSON.stringify(req.body, null, 4));
    res.send('ok');
});

app.put('/b/:id',(req, res)=>{
    const id = req.params.id;
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === id){
            userBins[i] = req.body;
            fs.writeFileSync("./backend/userBins.JSON", JSON.stringify(userBins, null, 4));
            fs.writeFileSync(`./backend/${id}.JSON`, JSON.stringify(req.body, null, 4));
            res.send(req.body);
        }
    }
});

app.delete('/b/:id',(req, res)=>{
    const id = req.params.id;
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === id){
            fs.unlinkSync(`./backend/${userBins[i].id}.JSON`);
            userBins.splice(i, 1);
            fs.writeFileSync("./backend/userBins.JSON", JSON.stringify(userBins, null, 4));
            res.send('removed');
        }
    }
    
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === req.body.id){
           userBins.splice(i, 1);
            res.send('removed');
        }
    }
});

app.listen(5000);
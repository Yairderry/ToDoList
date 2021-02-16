const express = require('express');
const app = express();
app.use(express.json());

const {readFileSync} = require('fs');
const {writeFileSync} = require('fs');
const userBins = JSON.parse(readFileSync('./userBins.JSON', {encoding:'utf8', flag:'r'}));

app.get('/b', (req, res)=>{
    res.send(JSON.stringify(userBins))
});

app.get('/b/:id', (req, res)=>{
    const id = req.params.id;
    const data = readFileSync('./' + id + '.JSON', 
            {encoding:'utf8', flag:'r'});
    res.send(data);
});

app.post('/b',(req, res)=>{
    userBins.push(req.body);
    res.send('ok');
});

app.put('/b/:id',(req, res)=>{
    const id = req.params.id;
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === id){
            userBins[i] = req.body;
            writeFileSync("userBins.JSON", JSON.stringify(userBins));
            writeFileSync(`${id}.JSON`, JSON.stringify(req.body));
            res.send(req.body);
        }
    }
});

app.delete('/b',(req, res)=>{
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === req.body.id){
           userBins.splice(i, 1);
            res.send('removed');
        }
    }
});

app.listen(5000);
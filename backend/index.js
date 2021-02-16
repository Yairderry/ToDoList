const express = require('express');
const app = express();
app.use(express.json());

const {readFileSync} = require('fs');
const userBins = readFileSync('./userBins.JSON', {encoding:'utf8', flag:'r'});

app.get('/b', (req, res)=>{
    res.send(userBins)
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

app.put('/b',(req, res)=>{
    for(let i = 0; i< userBins.length; i++){
        if(userBins[i].id === req.body.id){
           userBins[i] = req.body;
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
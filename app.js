const express = require('express');
const bodyParser = require('body-parser');
const KeywordExtractor = require('./src/KeywordExtractor');

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/', (req, res) => {
    const text = req.body.text;
    const extracted = KeywordExtractor.extractSubject(text);
    res.send(extracted);
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

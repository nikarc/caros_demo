let http = require('http');
let express = require('express');
let app = express();
let path = require('path');

const PORT = 8080;

app.use('/static', express.static(__dirname + '/static'));
app.use('/bower', express.static(__dirname + '/bower_components'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname + '/demo.html'));
});

let server = app.listen(process.env.port || PORT, () => {
  let host = server.address().adress;

  console.log(`Server started at http://${host}:${PORT}`);
});

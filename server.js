// Configurando ambiente para nossa API

const http = require('http'); // aqui estancia o nome do nosso ambiente
const app  = require('./app'); // aqui puxa a informação que foram passadas
const port = process.env.PORT || 4000; // aqui fala qual o tipo da porta que usaremos
const server = http.createServer(app);
server.listen(port); 
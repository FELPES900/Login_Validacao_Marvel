const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const rotaUsuario = require('./routes/routes');

app.use(bodyParser.urlencoded({ extended: false })); // aceita apenas dados simples
app.use(bodyParser.json()); // json de netrada no body

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') // aqui expecificamos qual o servidor poderar usar como passamos o "*" estamos falando que todas podem as empressas podem ter acesso
    res.header( // Os tipos de cabeçalhos que aceitaremos
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTION') { // Os tipos de metodos que aceitaremos
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    };

    next();
});

app.use('/usuarios', rotaUsuario);

// Quando mão encontra reta, entra aqui:
app.use((req, res, next) => {
    const erro = new Error("Não encontrado")
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            menssagem: error.message
        }
    });
});

module.exports = app;
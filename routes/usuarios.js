const express = require('express');
const route = express.Router();
const mysql = require('../mysql').connection;
const path = require('path');
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache
const axios = require('axios').default;
const session = require('express-session')
const username = process.env.ADMIN;
const password = process.env.PASSOWORD;
const credentials = `${username}:${password}`;
const paginate = new Array();
const credentialsEncondent = Buffer.from(credentials).toString('base64');
const url = "http://comagranju.ddns.com.br:2458/rest/GET/PATH/CHAR/";
// const herois = ["1009282", "1014873", "1009733"];
const herois = ["1009282", "1014873"];

const sleep = (miliseconds) => { return new Promise(resolve => setTimeout(resolve, miliseconds)) }
/*
1 - logout
2 - telinha pra ver meus herois, com login e logout
3 - salvar no banco os herois
4 - CRUD dos herois, buscar novos herois, adcionar herois, deletar herois
5 - aplicar as praticas do que te passei no whatsapp
    ## Iniciantes
    - Entenda bem a notação assintótica (O(1), O(N), O(lg N), etc )

    - Entenda a diferença entre “O de N”, “Theta de N” e “Omega de N”

    - Implemente as seguintes estruturas de dados na mão várias vezes, até não ter que pensar: Lista encadeada (simples, dupla e circular), Stack, Hash Table, Lista dinâmica e Árvore binária de busca

    - Aprenda todas as collections da sua linguagem de programação e saiba qual estrutura de dados elas implementam por baixo dos panos. Conheça os métodos delas e entenda bem a diferença entre set e map (e quando usar).

    - Aprenda a resolver problemas usando força bruta muito bem! No pior dos casos, é o método que você vai usar na entrevista

    - Implemente busca binária várias vezes na mão. Depois que souber isso, busque se a sua linguagem tem as funções: binary search, lower bound e upper bound

    - Aprenda a técnica de janelas deslizantes para resolver problemas de vetores. Se quiser dica por onde começar, busque problemas de palíndromos e suas variações.
6 - usar o ENV para guardar informacoes secretas



15 19 24 27
*/
route.get('/visualizacao', async (req, res, next) => {
    try {
        for (let index = 0; index < herois.length; index++) {
            let element = herois[index];
            let { data } = await axios.get(url + element,
                {
                    headers: {
                        'Authorization': `Basic ${credentialsEncondent}`
                    }
                }
            )
            paginate.length;
            if (paginate.length === 0) {
                const paginate = new Array();
            }
            let id = data.ID;
            let name = data.Name;
            let descricao = data.Descricao
            let observacao = data.Observacao
            mysql.getConnection((error, conn) => {
                if (error) { return res.status(500).send({ error: error }) };
                conn.query(
                    "INSERT JOIN herois (id, Name, Descricao, Obsevacao) VALUES (?,?,?,?);",
                    [id,name,descricao,observacao],
                    (err, results) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) };

                        const resposta = {
                            menssagem: "Herois cadastrados com sucesso",
                        }
                        return res.status(201).send({ resposta });

                    })
            })
        }
    } catch (error) {
        console.log(error);
    }
});

route.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM users WHERE username = ?',
            [req.body.username],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }) };
                if (results.length > 0) {
                    res.status(409).send({ menssagem: 'Email já está cadastrado' })
                }
                else {
                    bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                        if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                        conn.query(
                            'INSERT INTO users (username, password) VALUES (?,?)',
                            [req.body.username, hash],
                            (error, result) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error }) };
                                const response = {
                                    menssagem: 'Usuario criado com suecesso',
                                    usuarioCriado: {
                                        email: req.body.username
                                    }
                                }
                                return res.status(201).send({ response });
                            }
                        )
                    });
                }
            }
        );
    });
});
route.post('/login', async (req, res, next) => {
    console.log(req.body.username, req.body.password);
    try {
        if (paginate.length == 0 || paginate < 3) {
            for (let index = 0; index < herois.length; index++) { //Notacao oN
                let element = herois[index];
                let { data } = await axios.get(url + element,
                    {
                        headers: {
                            'Authorization': `Basic ${credentialsEncondent}`
                        }
                    }
                );

                // let objeto = JSON.parse(data)
                console.log(data);
                paginate.length;
                if (paginate.length === 0) {
                    const paginate = new Array();
                }
                paginate.push(data);
            };
        }
        // res.status(200).json({ response: paginate })
    } catch (error) {
        console.log(error);
    }
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        const query = 'SELECT * FROM users WHERE username = ?';
        conn.query(query, [req.body.username], (error, results, fields) => {
            conn.release();
            console.log(req.body.username);
            if (error) { return res.status(500).send({ error: error }) };
            if (results.length < 1) {
                return res.status(401).send({ menssagem: 'Falha na altenticação 1' });
            };
            bcrypt.compare(req.body.password, results[0].password, (err, result) => {
                if (err) {
                    return res.status(401).send({ menssagem: 'Falha na altenticação 2' });
                };
                if (results[0].username == "felipefraga.assis@gmail.com") {
                    if (result) {
                        const token = jwt.sign({
                            id_usuario: results[0].id_usuario,
                            email: results[0].username
                        },
                            process.env.TOKEN_SECRET,
                            {
                                expiresIn: "1h"
                            }
                        );
                        return res.status(200).send({
                            menssagem: 'Authenticado com sucesso',
                            response: paginate[2],
                            token: token
                        });
                    }
                }
                if (results[0].username == "gabrijac58@gmail.com") {
                    if (result) {
                        const token = jwt.sign({
                            id_usuario: results[0].id_usuario,
                            email: results[0].username
                        },
                            'segredo',
                            {
                                expiresIn: "1S"
                            }
                        );
                        return res.sendFile(path.join(__dirname, "../frontend/view.html"));
                    }
                }
                return res.status(401).send({ menssagem: 'Falha na altenticação 3' });
            });
        });
    })
})
route.get('/logando', async (req, res, next) => {
    return res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
route.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        try {
            req.logOut();
            res.redirect(config.destroySessionUrl);
        } catch (error) {
            console.log(error);
        }
    });
});

module.exports = route;
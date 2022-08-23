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
const herois = [
    // esta na pasta REASME.MD todos os IDS que fora cadastrados no banco de dados
];

// const sleep = (miliseconds) => { return new Promise(resolve => setTimeout(resolve, miliseconds)) }
route.post('/visualizacao', async (req, res, next) => {
    for (let index = 0; index <= herois.length; index++) {
        let element = herois[index];
        let { data } = await axios.get(url + element,
            {
                headers: {
                    'Authorization': `Basic ${credentialsEncondent}`
                }
            }
        );
        paginate.push(data);
        var lista = paginate;
        if (index == 1) {
            var lista_2 = new Array();
            lista.forEach((e) => {
                if (e["SUCESS"] != "no") {
                    lista_2.push(e);
                    mysql.getConnection(async (error, conn) => {
                        if (error) { return res.status(500).send({ error: error }); };
                        let id = e["ID"];
                        let name = e["Name"];
                        let descricao = e["Descricao"];
                        let observacao = e["Observacao"];
                        try {
                            conn.query(
                                "INSERT INTO herois (id, Name, Descricao, Observacao) VALUES (?,?,?,?);",
                                [id, name, descricao, observacao],
                                (error, results) => {
                                    if (error) { return res.status(500).send({ error: error }); };
                                    const resposta = { menssagem: "Herois cadastrados com sucesso" }
                                    return res.status(201).json({ Resposta: resposta });
                                }
                            )
                            conn.release()

                        } catch (error) {
                            console.log(error);
                        }

                    });
                }
            })
        }
    };
});

route.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); };
        conn.query(
            'SELECT * FROM users WHERE username = ?',
            [req.body.username],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }); };
                if (results.length > 0) { res.status(409).send({ menssagem: 'Email já está cadastrado' }) }
                else {
                    bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                        if (error) { return res.status(500).send({ error: error }); };
                        conn.query(
                            'INSERT INTO users (username, password) VALUES (?,?);',
                            [req.body.username, hash],
                            (error, result) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error }); };
                                const response = {
                                    menssagem: 'Usuario criado com suecesso',
                                    usuarioCriado: {
                                        email: req.body.username
                                    }
                                }
                                return res.status(201).send({ Resposta: response });
                            }
                        )
                    });
                }
            }
        );
    });
});
route.post('/login', async (req, res, next) => {
    let user_herois = [];
    let herois = new Array();
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); };
        conn.query(
            'SELECT * FROM users WHERE username = ?;',
            [req.body.username],
            (error, results, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }); };
                if (err) { return res.status(401).send({ menssagem: 'Falha na altenticação 2' }); }
                bcrypt.compare(req.body.password, results[0].password, (err, result) => {
                    if (err) { return res.status(401).send({ menssagem: 'Falha na altenticação 2' }); }
                    const token = jwt.sign({
                        id_usuario: results[0].id,
                        email: results[0].username
                    },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    if (result.length = 1) {
                        if (error) { return res.status(500).send({ error: error }); };
                        let user = results[0].username;
                        conn.query(
                            "SELECT * FROM users_herois WHERE id_users = ?",
                            [results[0].id],
                            (error, results, fields) => {
                                user_herois = results;
                                user_herois.forEach((e) => {
                                    if (error) { return res.status(500).send({ error: error }); };
                                    conn.query(
                                        "SELECT * FROM herois WHERE id = ?;",
                                        [e.id_herois],
                                        (error, results, fields) => {
                                            if (error) { return res.status(500).send({ error: error }); };
                                            results.forEach((e) => {
                                                herois.push({
                                                    ID: e['id'],
                                                    NAME: e["Name"],
                                                    DESCRICAO: e['Descricao'],
                                                    OBSERVACAO: e["Observacao"]
                                                });
                                            })
                                            if (user_herois.length == herois.length) {
                                                return res.status(201).send({
                                                    menssagem: "logado com sucesso",
                                                    Usuario: user,
                                                    Herois: herois,
                                                    request: {
                                                        tipo: 'POST',
                                                        descricao: "Cadastro de herois no usuario",
                                                        url: "localhost:3000/usuarios/users-heroi"
                                                    },
                                                    token: token
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                        );
                    }
                });
            }
        );
    })
})

route.post('/users-heroi', async (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            "SELECT * FROM users WHERE username = ?;",
            [req.body.username],
            (error, results, fields) => {
                if (error) { return res.status(500).send({ error: error }) };
                if (results.length < 1) { return res.status(401).send({ menssagem: 'Falha na altenticação' }); };
                if (results.length = 1) {
                    if (error) { return res.status(500).send({ error: error }); };
                    conn.query(
                        "INSERT INTO users_herois (id_users, id_herois) VALUES (?, ?);",
                        [results[0].id, req.body.heroi],
                        (error, results, fields) => {
                            if (error) { return res.status(500).send({ error: error }); };
                            if (results.length > 0) { res.status(409).send({ menssagem: 'Este Heroi ja esta cadastro no seu usuario' }); }
                            conn.release();
                            if (results.length < 1) { return res.status(401).send({ menssagem: 'Falha na altenticação' }); };
                            return res.status(201).send({
                                Menssagem: "Cadastro com sucesso",
                                request: {
                                    tipo: 'POST',
                                    descricao: "Login dos usuarios",
                                    url: "localhost:3000/usuarios/login"
                                }
                            });
                        }
                    );
                }
            }
        )
    });
});

module.exports = route;
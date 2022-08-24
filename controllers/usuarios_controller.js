const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache

exports.CadastroUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); };
        conn.query(
            'SELECT * FROM users WHERE username = ?',
            [req.body.username],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }); };
                if (results.length > 0) { return res.status(409).send({ menssagem: 'Email já está cadastrado' }) }
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
};

exports.LoginUser = async (req, res, next) => {
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
                if (error) { return res.status(401).send({ menssagem: 'Falha na altenticação 2' }); }
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
                                            };
                                        }
                                    );
                                });
                            }
                        );
                    };
                });
            }
        );
    });
};

exports.CadastroDeHeroiAoUsuario = async (req, res, next) => {
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
                            if (results.length > 0) { return res.status(409).send({ menssagem: 'Este Heroi ja esta cadastro no seu usuario' }); }
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
                };
            }
        );
    });
};
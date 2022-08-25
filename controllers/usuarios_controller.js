const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache

exports.CadastroUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); };
        conn.query(
            'SELECT * FROM users WHERE username = ?',
            [req.body.email],
            (error, results) => {
                if (error) { return res.status(500).send({ error: error }); };
                if (results.length > 0) { return res.status(409).send({ menssagem: 'Email já está cadastrado' }) }
                else {
                    bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                        if (error) { return res.status(500).send({ error: error }); };
                        conn.query(
                            'INSERT INTO users (username, password) VALUES (?,?);',
                            [req.body.email, hash],
                            (error, result) => {
                                conn.release();
                                if (error) { return res.status(500).send({ error: error }); };
                                const response = {
                                    menssagem: 'Usuario criado com suecesso',
                                    usuarioCriado: {
                                        email: req.body.email
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
    var userName;
    var userId;
    let lista = [];
    let listaid = [];
    mysql.getConnection((error, conn) => {
        // Bloco responsavel para fazer altenticação
        conn.query(
            'SELECT * FROM users WHERE username = ?;',
            [req.body.email],
            (error, results) => {
                conn.release();
                if (results == false) { return res.status(400).json({ Resposta: "esse email nao esta cadastrado" }) }
                userName = results[0].username;
                userId = results[0].id;
                bcrypt.compare(req.body.password, results[0].password, (err, result) => {
                    const token = jwt.sign({ id_usuario: results[0].id, email: results[0].username }, process.env.TOKEN_KEY, { expiresIn: "1h" });
                    conn.query(
                        "SELECT * FROM users_herois WHERE id_users = ?",
                        [userId],
                        (error, results) => {
                            if (results == false) { return res.status(200).json({ Resposta: [] }) }
                            results.forEach(herois => {
                                listaid.push(herois['id_herois']);
                                if (listaid.length == results.length) {
                                    listaid.forEach(element => {
                                        conn.query(
                                            "SELECT * FROM herois WHERE id = ?;",
                                            [element],
                                            (error, resultsHerois) => {
                                                lista.push({
                                                    "ID": resultsHerois[0].id,
                                                    "Name": resultsHerois[0].Name,
                                                    "Descricao": resultsHerois[0].Descricao,
                                                    "Obsercacao": resultsHerois[0].Observacao
                                                });
                                                if (lista.length == listaid.length) {
                                                    return res.status(200).json({
                                                        User: userName,
                                                        Resposta: {
                                                            Menssagem: "Herois lincado ao seu usuario",
                                                            lista
                                                        },
                                                        token: token
                                                    })
                                                }
                                            }
                                        )
                                    });
                                }
                            });
                        }
                    )
                })
            }
        );
    })
};

exports.CadastroDeHeroiAoUsuario = async (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            "SELECT * FROM users WHERE username = ?;",
            [req.body.email],
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
                                Menssagem: "O heroi agora esta vinculado a sua conta",
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

exports.DeleteHeroisRelacionadosAoUsuario = async (req, res, next) => {
    mysql.getConnection((error, conn) => {
        conn.query(
            "SELECT * FROM users WHERE username = ?;",
            [req.body.email],
            (error) => {
                conn.release();
                conn.query(
                    "DELETE FROM users_herois WHERE id_herois = ?;",
                    [req.body.heroi],
                    (error, resultsHerois) => {
                        return res.status(200).json({ Menssagem: "Heroi foi descvinculado a voce" });
                    }
                )
            }
        );
    });
};
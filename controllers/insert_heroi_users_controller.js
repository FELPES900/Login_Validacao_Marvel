const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache

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
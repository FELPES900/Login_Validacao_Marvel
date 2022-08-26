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

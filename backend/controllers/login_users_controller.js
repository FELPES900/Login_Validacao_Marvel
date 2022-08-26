const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache

exports.LoginUser = async (req, res) => {
    var userName;
    var userId;
    let lista = [];
    let listaid = [];
    mysql.getConnection((conn) => {
        // Bloco responsavel para fazer altenticação
        conn.query(
            'SELECT * FROM users WHERE username = ?;',
            [req.body.email],
            (results) => {
                conn.release();
                if (results == false) { return res.status(400).json({ Resposta: "esse email nao esta cadastrado" }) }
                userName = results[0].username;
                userId = results[0].id;
                bcrypt.compare(req.body.password, results[0].password, (err, result) => {
                    const token = jwt.sign({ id_usuario: results[0].id, email: results[0].username }, process.env.TOKEN_KEY, { expiresIn: "1h" });
                    conn.query(
                        "SELECT * FROM users_herois WHERE id_users = ?",
                        [userId],
                        (results) => {
                            if (results == false) { return res.status(200).json({ Resposta: [] }) }
                            results.forEach(herois => {
                                listaid.push(herois['id_herois']);
                                if (listaid.length == results.length) {
                                    listaid.forEach(element => {
                                        conn.query(
                                            "SELECT * FROM herois WHERE id = ?;",
                                            [element],
                                            (resultsHerois) => {
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
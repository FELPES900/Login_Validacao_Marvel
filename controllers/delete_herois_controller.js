const mysql = require('../mysql').connection;
const bcrypt = require('bcrypt'); // com isso nossas senhar de ususarios serao cripitografasdas
const jwt = require('jsonwebtoken');   // aqui vamos criar um token por quanto tempo os daods podem ficar salvo no cache

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
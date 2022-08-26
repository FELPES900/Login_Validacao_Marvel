const mysql = require('../mysql').connection;

exports.DeleteHeroisRelacionadosAoUsuario = async (req, res) => {
    mysql.getConnection((conn) => {
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
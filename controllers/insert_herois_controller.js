const axios = require('axios').default;
const mysql = require('../mysql').connection;
const username = process.env.ADMIN;
const password = process.env.PASSOWORD;
const credentials = `${username}:${password}`;
const paginate = new Array();
const credentialsEncondent = Buffer.from(credentials).toString('base64');
const url = process.env.URL;
const herois = [
    // esta na pasta REASME.MD todos os IDS que fora cadastrados no banco de dados
];

// const sleep = (miliseconds) => { return new Promise(resolve => setTimeout(resolve, miliseconds)) }

exports.postHerois = async (req, res, next) => {
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
}
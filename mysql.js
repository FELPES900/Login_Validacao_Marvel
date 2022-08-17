const mysql = require('mysql');

const connection = mysql.createPool({
    "user"     : process.env.MYSQL_USERS,
    "password" : process.env.MYSQL_PASSOWORS,
    "database" : process.env.MYSQL_DATABASE,
    "host"     : process.env.MYSQL_HOST
});

exports.connection = connection;
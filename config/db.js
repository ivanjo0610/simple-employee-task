const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'MySQLL0c4l-',
    database: 'employees',
    port: '3306'
});

module.exports = pool;

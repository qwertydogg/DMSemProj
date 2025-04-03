const express = require('express');
const mysql = require('mysql')
const cors = require('cors')

const app = express()
app.use(cors({ origin: "http://localhost:5173" }));

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '38Vc49md',
    database: 'contractormanagement'

})

app.get('/', (re, res) => {
    return res.json("From Backend Side");
})

app.get('/clients', (req, res) => {
    const sql = "SELECT * FROM clients";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.listen(8081, ()=> {
    console.log("listening");
})

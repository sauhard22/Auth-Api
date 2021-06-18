const mysql = require('mysql')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const saltRounds = 10

const app = express()


const port = process.env.port || 3002

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
        key: "userID",
        secret: "yourKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60*60*24,
        },
    })
);

var db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: 'password',
    database: 'LoginSystem',
    multipleStatements: true
})

db.connect((err)=>{
    if(!err){
        console.log('Connected');
    }
    else{
        console.log('Connection Failed ' + err);
    }
})

app.post('/register', (req,res)=>{
    
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, saltRounds, (err,hash) => {

        if(err){
           console.log(err) 
        }

        db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], 
        (err, result) =>{
        console.log(err)
        })
    })
    
    
})

app.get("/login", (req,res)=>{
    if(req.session.user) {
        res.send({loggedIn : true, user: req.session.user})
    }else{
        res.send({loggedIn : false})
    }
})

app.post('/login', (req,res)=>{
    const username = req.body.username
    const password = req.body.password
    
    db.query("SELECT * FROM users WHERE username = ?;", 
    username, 
    (err, result) =>{
        if(err){
            res.send({err : err})
        }
        if(result.length  >0){
            bcrypt.compare(password, result[0].password, (err,response)=>{
                if(response){
                    req.session.user = result;
                    console.log(req.session.user)
                    res.send(result)
                }
                else{
                    res.send({message: "Wrong username/password combination!"})
                }
            })
        }else{
            res.send({message: "User dosen't exist"})
        }

     })   
})

app.listen(3002)
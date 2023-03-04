var express = require('express');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middlewares/auth');
var cors = require('cors')

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

var firebase = require('firebase/app');
var firebaseStorage = require('firebase/storage')

var app = express();
app.use(cors())
var port = process.env.PORT || 4000;

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: '68.178.148.238', 
  user: 'scoreupp_dev',     
  password: 'rcoa48u%dLZN',      
  database: 'scoreupp' 
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});

const firebaseConfig = {
   apiKey: "AIzaSyAb8muj9R63oTCUnwbArgz5HEVe5d8AFOI",
   authDomain: "scoreupp-2a508.firebaseapp.com",
   projectId: "scoreupp-2a508",
   storageBucket: "scoreupp-2a508.appspot.com",
   messagingSenderId: "208021447593",
   appId: "1:208021447593:web:67b6e295734c3261961ab8",
   measurementId: "G-0T5WQ1V75N"
 };

const firebaseApp = firebase.initializeApp(firebaseConfig);
const storage = firebaseStorage.getStorage(firebaseApp);

const ref = firebaseStorage.ref(storage, "images");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
  
app.get('/', (req, res) => {
    res.send(req.headers);
});
 
app.post('/upload', async (req, res) => {
   console.log(req)
   const { college, course, subject, semester, url, paper_name, preview_url} = req.body;
   
   var sql = "INSERT INTO `pdf-collection` (`id`, `name`, `url`, `preview_url`, `college`, `course`, `subject`, `semester`) VALUES ("+null+", '"+ paper_name +"', '"+ url +"', '"+ preview_url + "', '" + college +"', '"+ course +"', '"+ subject +"', "+ semester +");";
   conn.query(sql, function(err, result) {
       if(err) {
         return res.status(400).json({ message: err })
       }
       return res.send({ message: 'File is successfully stored.', result });
    });
});

app.get('/retrieve', verifyToken, async (req, res) => {
   const { college, course, subject, semester } = req.query;
   console.log(college)
   var sql = "SELECT * FROM `pdf-collection` WHERE `college` = '" + college +"' OR `course` = '" + course +"' OR `subject` = '" + subject + "'" +" OR `semester` = '" + semester + "'";
   console.log(sql)
   conn.query(sql, function(err, result) {
      if(err) {
        return res.status(400).json({ message: err })
      }
      return res.send({ message: 'File(s) retrieved', result });
   });
})

app.post('/register', async (req, res) => {
   const { name, email, password } = req.body;
   console.log(req.body)
   console.log(password)
   const salt = bcrypt.genSaltSync(10);
   const passHash = await bcrypt.hashSync(password, salt);

   var sql = "INSERT INTO `user-information` (`id`, `name`, `email`, `password`, `joined_on`) VALUES ("+null+", '" + name+ "', '" + email + "', '" + passHash+ "', " +  Date.now() + ");";
   conn.query(sql, function(err, result) {
      if(err) {
        return res.status(400).json({ message: err })
      }
      return res.send({ message: 'User successfully created', result});
   });
})

app.get('/login', async (req, res) => {
   const { email, password } = req.query;

   var sql = "SELECT * FROM `user-information` WHERE `email` = '" + email +"'";
   conn.query(sql, function(err, result) {
      if(err) {
        return res.status(400).json({ message: err })
      }
      if(bcrypt.compareSync(password, result[0].password)){
         const stringified_res = JSON.stringify(result[0]);
         const token = jwt.sign({stringified_res}, process.env.PRIVATE_KEY, {expiresIn: 604800});
         return res.send({ message: 'User logged in', result, token });
      }
      return res.status(400).send({"success" : false, "msg": "Invalid password"})
   });
})
 
app.listen(port, () => {
    console.log('Server started on: ' + port);
});
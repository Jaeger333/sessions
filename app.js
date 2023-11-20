const express = require("express");
const path = require("path");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./users.db', {verbose: console.log})
const session = require('express-session')
const dotenv = require('dotenv');
dotenv.config()
const bcrypt = require('bcrypt')



const app = express();
const staticPath = path.join(__dirname, 'public')
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    //secret: process.env.SESSION_SECRET,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.post('/login', (req, res) => {
   console.log(req.body)
    if (req.body.username === validUser.username && req.body.password === validUser.password) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        req.session.loggedIn = false;
        res.sendFile(path.join(__dirname, "public/loginForm.html"));
    }
    
});


//app.use(express.json());


app.use((req, res, next)=>{
    console.log(req.session.loggedIn)
    if (req.session.loggedIn){
        console.log("Bruker innlogget")
        next()
    }
    else {
        res.sendFile(path.join(__dirname,"public", "loginForm.html"))
    }
})

app.use(express.static(staticPath));



async function getUsers(request, response) {

    if (checkLoggedIn(request, response)) {

    let users = null
    const sql=db.prepare('SELECT username, firstname, lastname, mobile FROM user')
    let rows = sql.all()   //await db.query(sql)
    console.log("rows.length",rows.length)
    if (rows.length === 0) {
        console.log("No users found. Empty DB")

        users = await getAPIUsers()
        users.forEach(user => {
            console.log(user.name.first, user.name.last)
            addUser(user.login.username, user.name.first, user.name.last, user.cell)
        })

    }
    else {
        users = rows.map(user => ({
            name: {
                first: user.firstname,
                last: user.lastname,
            },
            login: {
                username: user.username,
            },
            cell: user.mobile,
            picture: {
                large: user.picture // You will need to provide a proper URL or handle this on the client-side.
            }
        }));
        //console.log(users)
    }
    response.send(users);
}
}

function addUser(username, password, firstName, lastName, mobile, role) {
    const sql = db.prepare("INSERT INTO user (username, password, firstName, lastName, mobile, role) values (?, ?, ?, ?, ?, ?)")
    const info = sql.run(username, password, firstName, lastName, mobile, role)
}

//passord hash test
const saltRounds = 10
const password1 = "pass123"

const hash = bcrypt.hashSync(password1, saltRounds);
console.log("Hash: " + hash)

const password2 = "pass123"
const result = bcrypt.compareSync(password2, hash);
console.log("Result of comparing passwords: " + result)

addUser("user123", "pass123", "fname", "lname", "mobile", hash)


function updateUserDB(username, firstName, lastName, mobile) {
    const sql = db.prepare("update user set firstName=(?), lastName =(?), mobile=(?)  where username=(?)")
    const info = sql.run(firstName, lastName, mobile, username)
}

async function getAPIUsers() {
    const url="https://randomuser.me/api/?results=10&nat=no"
    const fetch_response = await fetch(url)
    const json = await fetch_response.json()
    return(json.results)

}


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"public", "loginForm.html"))
})

function checkLoggedIn(request, response) {
    console.log("checkloggedin", request)
    if (typeof(request) == "undefined" || typeof(request.session) == "undefined" || !request.session.loggedIn){
        
        response.redirect('/login');
        return false
        
    }
    else { 
        response.sendFile(path.join(__dirname, "public/index.html"));  
        return true
    }
}



app.get("/users", getUsers);

app.post("/user", (req, res) => {
    console.log(req.body)
    const user = req.body
    updateUserDB(user.username, user.firstname, user.lastname, user.cell)
    res.sendFile(path.join(__dirname, "public/index.html"));
})

app.get("/users.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/users.html"));
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});


const validUser = {
    username: 'user123',
    password: 'pass123'
};




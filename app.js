const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const cookieParser = require('cookie-parser')
const fs = require('fs');
const path = require('path');
const { Users } = require('./db.js');
const jwt = require('jsonwebtoken')

require("dotenv").config();
app.use(fileUpload({safeFileNames: true, preserveExtension: true, preserveExtension: 4}))
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('./assets'))
app.use(express.urlencoded({ extended: true }));

const jwt_secret = process.env.JWT_SECRET;

function generateAccessToken(username) {
    const payload = { "username": username };
    return jwt.sign(payload, jwt_secret);
}

function authenticateToken(req, res, next) {
    const jwt_token = req.cookies.authToken;
    if (jwt_token == null)
        return res.redirect('/login')

    jwt.verify(jwt_token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        Users.findOne({ attributes: ['username', 'profilePic'], where: { username: user.username } })
            .then((queryResult) => {
                if (queryResult == null) {
                    res.clearCookie('authToken', '')
                    res.redirect('/login');
                } else {
                    req.user = queryResult
                    next()
                }
            })
    })
}

app.get('/', authenticateToken, (req, res) => {
    res.redirect('/profile')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/logout', (req, res) => {
    res.clearCookie('authToken', '')
    res.redirect('/login');
})

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username == '' & password == '') {
        res.status(400).send()
        return
    }
    Users.findOne({ where: { username: username, password: password } })
        .then(user => {
            if (user) {
                const jwt_token = generateAccessToken(username);
                res.cookie('authToken', jwt_token);
                res.status(200).send("/");
            }
            else {
                res.status(403).send("Invalid username/password.");
            }
        })
})

app.get('/profile', authenticateToken, (req, res) => {
    var profilePic = req.user.profilePic
    res.render('profile', {
        username: req.user.username,
        profilePic: profilePic
    })
})

// file upload handling

app.post('/upload', authenticateToken, function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).send('No files were uploaded.');
    const profilePic = req.files.profilePic;
    const profilePicName = profilePic.name
    const profilePicExtension = path.extname(profilePicName)
    const allowedExtension = ['.png', '.jpg', '.jpeg']
    if (!allowedExtension.includes(profilePicExtension))
        return res.status(422).send('Only .png, .jpg, .jpeg files are allowed')
    const allowedMimetype = ["image/png", "image/jpg", "image/jpeg"]
    if (!allowedMimetype.includes(profilePic.mimetype))
        return res.status(422).send('Invalid media type')
    if (profilePic.size > 5 * 1024 * 1024)
        return res.status(422).send('File size limit exceeded')
    const uploadDir = __dirname + `/assets/uploads/`;
    if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir);
    const uploadPath = uploadDir + profilePicName
    profilePic.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send("Interal server error");
        Users.update({ profilePic: profilePicName   }, { where: { username: req.user.username } })
            .then((msg) => {
                res.redirect('/profile');
            })
            .catch((err) => {
                res.status(500).send('Internal server')
            })
    })
});

app.listen(3000, () => { console.log("listening on port 3000") })

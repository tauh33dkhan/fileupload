const Sequelize = require('sequelize');
const crypto = require('crypto');
require("dotenv").config();


const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, {
    dialect: 'mysql',
    dialectOptions: {
        host: process.env.DB_HOST
    }
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connected to database!')
    })
    .catch((err) => {
        console.log(err)
        console.log('Unable to connect to database!')
    });

const Users = sequelize.define('users', {
    'username': Sequelize.STRING,
    'password': Sequelize.STRING,
    "profilePic": {
        type: Sequelize.STRING,
        defaultValue: "default.png"
    }
})

sequelize.sync({ force: true })
    .then(() => {
        Users.bulkCreate([
            {
            username: 'superman', 
            password: 'superpowers',
            profilePic: 'default.png'
        },
        {
            username: 'batman',
            password: 'iamrich',
            profilePic: 'default.png'
        }
        ]);
    })
    .catch((err) => {
        console.log(err)
        console.log('Unable to connect to database!')
    });

module.exports = {
    Users,
}

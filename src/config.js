'use strict';
const path = require('path');
/* const dotenv = require('dotenv').config({
    path: path.join(__dirname,'../settings.env')
}); */
const {ExitCode} = ('./constants');
/* 
if (dotenv.error) {
    console.error(`Can't get env variables. Error: ${ dotenv.error }`);
    process.exit(ExitCode.error);
} */

module.exports = {
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    db_user_name: process.env.DB_USER_NAME,
    db_user_password: process.env.DB_USER_PASSWORD,
    db_dialect: process.env.DB_DIALECT,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    log_level: process.env.LOG_LEVEL
}
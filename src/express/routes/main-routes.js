'use strict';

const {Router} = require('express');
const {getHomePage, getSearch,get_signUpPage, post_signUpPage, getLoginPage, postLoginPage, getLogout} = require('../controllers/main-controllers');
const {uploadFile, deleteFile} = require('../multer');
const mainRouter = new Router();

mainRouter.get(`/`, getHomePage);

mainRouter.get(`/sign-up`,deleteFile, get_signUpPage);
mainRouter.post(`/sign-up`, uploadFile, post_signUpPage);

mainRouter.get(`/login`, getLoginPage);
mainRouter.post(`/login`, postLoginPage);
mainRouter.get(`/logout`, getLogout)

mainRouter.get(`/search`,getSearch);

module.exports = mainRouter;
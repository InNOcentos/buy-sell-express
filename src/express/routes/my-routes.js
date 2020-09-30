'use strict';

const {Router} = require('express');
const {getMyPage,getMyComments,postMyPage,postMyComments} = require(`../controllers/my-controllers`);
const myRouter = new Router();

myRouter.get(`/`, getMyPage);
myRouter.post(`/`, postMyPage);
myRouter.get(`/comments`,getMyComments);
myRouter.post(`/comments`,postMyComments);

module.exports = myRouter;
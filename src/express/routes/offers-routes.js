'use strict';

const {Router} = require('express');
const {getAddPost, postAddPost, getPostEdit,putPostEdit,get_offerById, post_commentById, getOffersByCategory} = require(`../controllers/offers-controllers`);
const {uploadFile, deleteFile} = require('../multer');
const offersRouter = new Router();

offersRouter.get(`/category/:id`, getOffersByCategory); 

offersRouter.get(`/add`,deleteFile, getAddPost);
offersRouter.post(`/add`, uploadFile, postAddPost);

offersRouter.get(`/edit/:id`, getPostEdit);
offersRouter.post(`/edit/:id`, uploadFile, putPostEdit);

offersRouter.get(`/:id`, get_offerById);
offersRouter.post(`/:id`, post_commentById);

module.exports = offersRouter;


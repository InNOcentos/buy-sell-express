"use strict";

const { request } = require(`../request`);
const { HttpCode, API_URL } = require(`../../constants`);
const {
  setUserCookie,
  clearUserCookie,
  ifUserAuthorisedCheck,
  ifIsUserOfferCheck,
} = require(`../helpers/jwt-helper`);
const { cookieStorageTime,page_pagination } = require(`./constants`)
var offerImg = '';

exports.getAddPost = async (req, res, next) => {
  try {
    ifUserAuthorisedCheck(req, res, clearUserCookie, setUserCookie);

    const { statusCode, body: categories } = await request.get({
      url: `${API_URL}/category`,
      json: true,
    });

    if (statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    return res.render(`offers/new-ticket`, {
      categories,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.postAddPost = async (req, res, next) => {
  try {
    const categoriesResult = await request.get({
      url: `${API_URL}/category`,
      json: true,
    });

    if (categoriesResult.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    const { avatar, title, description, category, sum, type } = req.body;

    const offerCategories = Array.isArray(category) ? category : [category];
    
    const offer = {
      title,
      type,
      category: offerCategories,
      description,
      picture: avatar,
      sum,
    };

    const { statusCode, body } = await request.post({
      url: `${API_URL}/offers`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
      body: offer,
    });

    if (statusCode === HttpCode.CREATED) {
      return res.redirect(`/my`);
    }

    if (
      statusCode === HttpCode.UNAUTHORIZED ||
      statusCode === HttpCode.FORBIDDEN
    ) {
      ifUserAuthorisedCheck(req, res, clearUserCookie, setUserCookie);
    }

    // вывод массива выбранных категорий по названиям
    const selectedCategories = offer.category;
    const allCategories = categoriesResult.body;

    const selectedOffers = (function () {
      return selectedCategories.map(element => {
        for (let i=0;i<allCategories.length;i++) {
          if (+element == allCategories[i]['id']) return allCategories[i]['title']
        }
      });
    })(); 

    return res.render(`offers/new-ticket`, {
      errorsArr: body,
      categories: categoriesResult.body,
      offer,
      selectedOffers,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getPostEdit = async (req, res, next) => {
  try {
    ifUserAuthorisedCheck(req, res, clearUserCookie, setUserCookie);
    
    const { id } = req.params;
    
    ifIsUserOfferCheck(req, res, id);

    const offersResult = await request.get({
      url: `${API_URL}/offers/${id}`,
      json: true,
    });

    if (offersResult.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    const categoriesResult = await request.get({
      url: `${API_URL}/category`,
      json: true,
    });

    if (categoriesResult.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }
    
    offerImg = offersResult.body.offer.picture;


    return res.render(`offers/ticket-edit`, {
      offer: offersResult.body.offer,
      categories: categoriesResult.body,
      selectedOffers: offersResult.body.offer.category,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.putPostEdit = async (req, res, next) => {
  try {
    var { id } = req.params;

    if (req.params.id === `undefined`) {
      id = req.cookies.user_offerEditId;
      return res.redirect(`/offers/edit/${id}`)
    }
    
    const categoriesResult = await request.get({
      url: `${API_URL}/category`,
      json: true,
    });

    if (categoriesResult.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }
    const { avatar, title, description, category, sum, type } = req.body;

    const offerCategories = Array.isArray(category) ? category : [category];

    const offer = {
      title,
      type,
      category: offerCategories,
      description,
      picture: avatar || offerImg,
      sum,
    };
    

    const updatedOffer = await request.put({
      url: `${API_URL}/offers/${id}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
      body: offer,
    });

    if (updatedOffer.statusCode === HttpCode.OK) {
      return res.clearCookie("user_offerEditId").redirect(`/my`);
    }

    if (
      updatedOffer.statusCode === HttpCode.UNAUTHORIZED ||
      updatedOffer.statusCode === HttpCode.FORBIDDEN
    ) {
      ifUserAuthorisedCheck(req, res, clearUserCookie, setUserCookie);
    }

    if (updatedOffer.statusCode === HttpCode.INTERNAL_SERVER_ERROR) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
    }


    const selectedCategories = offer.category;
    const allCategories = categoriesResult.body;

    const selectedOffers = (function () {
      return selectedCategories.map(element => {
        for (let i=0;i<allCategories.length;i++) {
          if (+element == allCategories[i]['id']) return allCategories[i]['title']
        }
      });
    })(); 

    console.log(selectedOffers)

    return res.cookie(`user_offerEditId`, `${id}`, { maxAge: cookieStorageTime.normalStorageTime, sameSite: true }).render(`offers/ticket-edit`, {
      categories: categoriesResult.body,
      offer,
      id,
      selectedOffers,
      errorsArr: updatedOffer.body,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.get_offerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await request.get({
      url: `${API_URL}/offers/${id}`,
      json: true,
    });

    if (offer.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    offer.body.offer.createdDate = offer.body.offer.createdDate.split("T")[0];

    const comments = await request.get({
      url: `${API_URL}/offers/${id}/comments`,
      json: true,
    });

    if (comments.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    return res.render(`offers/ticket`, {
      offer: offer.body.offer,
      user: offer.body.user,
      categories: offer.body.categoriesIds.categories,
      comments: comments.body,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.post_commentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const newComment = await request.post({
      url: `${API_URL}/offers/${id}/comments`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
      body: { comment },
    });

    if (newComment.statusCode === HttpCode.CREATED) {
      return res.redirect(`/offers/${id}`);
    }

    if (
      newComment.statusCode === HttpCode.UNAUTHORIZED ||
      newComment.statusCode === HttpCode.FORBIDDEN
    ) {
      ifUserAuthorisedCheck(req, res, clearUserCookie, setUserCookie);
    }

    if (newComment.statusCode === HttpCode.UNPROCESSABLE_ENTITY) {
      console.log(newComment.body);
    }

    const offer = await request.get({
      url: `${API_URL}/offers/${id}`,
      json: true,
    });

    if (offer.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    const comments = await request.get({
      url: `${API_URL}/offers/${id}/comments`,
      json: true,
    });

    if (comments.statusCode === HttpCode.NOT_FOUND) {
      return res.status(HttpCode.NOT_FOUND).render(`errors/404`);
    }

    return res.render(`offers/ticket`, {
      offer: offer.body.offer,
      user: offer.body.user,
      categories: offer.body.categoriesIds.categories,
      comments: comments.body,
      userComment: comment,
      errorsArr: newComment.body,
      id,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getOffersByCategory = async (req, res, next) => {
  var freshOffersList = [];
  try {
    const { id } = req.params;
  
    const categoryId = id;

    const { statusCode, body } = await request.get({
      url: `${API_URL}/search/${categoryId}`,
      json: true,
    });
    const results = statusCode === HttpCode.OK ? body : [];

    const freshOffers = await request.get({
      url: `${API_URL}/offers?limit=${page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE}`,
      json: true,
    });

    if (freshOffers.statusCode === HttpCode.OK) {
      freshOffersList = freshOffers.body.freshOffers.offers;
    }

    res.render(`search-result`, {
      results,
      offers:freshOffersList,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    return next(error);
  }
};

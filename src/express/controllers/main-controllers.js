"use strict";

const { request } = require(`../request`);
const { HttpCode, API_URL } = require(`../../constants`);
const { setUserCookie, clearUserCookie } = require(`../helpers/jwt-helper`);
const { page_pagination } = require('./constants')
const { createPaginationPages } = require(`./utils`);

exports.getHomePage = async (req, res, next) => {
  const { page } = req.query;
  const currentPage = page ? Number.parseInt(page, 10) : page_pagination.DEFAULT_PAGE;
  const offset = (currentPage - 1) * page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE;

  let freshOffers = [], valuableOffers = [], categories = [], offersQuantity = 0;

  try {
    
    if (!req.cookies.user_accessToken && req.cookies.user_refreshToken) {

      const { statusCode, body } = await request.post({
        url: `${API_URL}/user/refresh`,
        json: true,
        headers: {
          token: `${req.cookies.user_refreshToken}`,
        },
      });
      if (statusCode === HttpCode.OK) {

        const { accessToken, refreshToken, userData } = body;
        const { id, avatar } = userData;
        setUserCookie(refreshToken, accessToken, id, avatar, res);
      }
     
    }
  } catch (error) {
    next(error);
  }
  

  try {
    const { statusCode, body } = await request.get({
      url: `${API_URL}/offers?offset=${offset}&limit=${page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE}`,
      json: true,
    });

    if (statusCode === HttpCode.OK) {
      freshOffers = body.freshOffers.offers;
      valuableOffers = body.valuableOffers.offers;
      offersQuantity = body.freshOffers.quantity;
    }
  } catch (error) {
    next(error);
  }

  try {
    const { statusCode, body } = await request.get({
      url: `${API_URL}/category`,
      json: true,
    });

    if (statusCode === HttpCode.OK) {
      categories = body;
    }
  } catch (error) {
    next(error);
  }
  try {
    const pagesQuantity = Math.ceil(
      offersQuantity / page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE || 1 / page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE
    );
    const pages = createPaginationPages({ quantity: pagesQuantity, currentPage });
  
    res.render(`main`, {
      offers: freshOffers,
      valuableOffers,
      categories,
      pages,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error){
    next(error)
  }
  
};

exports.getSearch = async (req, res, next) => {
  if (req.query.search) {
    var freshOffersList = [];
    try {
      const encodedQuery = encodeURI(req.query.search);

      const { statusCode, body } = await request.get({
        url: `${API_URL}/search?query=${encodedQuery}`,
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

      res.render(`search-result`, { results,offers:freshOffersList, userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      }});
    } catch (error) {
      next(error);
    }
  }
};

exports.get_signUpPage = async (req, res, next) => {
  try {
    if (req.cookies.user_accessToken) return res.redirect('/');
    res.render(`sign-up`, {userData: {
      id: req.cookies.user_id,
      avatar: req.cookies.user_avatar,
    }
  });
  } catch (error) {
    next(error);
  }
};

exports.post_signUpPage = async (req, res, next) => {
  try {
    const {
      user_name,
      user_email,
      user_password,
      avatar,
      user_password_repeat,
    } = req.body;
    const userFullName = user_name.split(` `) || [userFullName];

    const userData = {
      firstName: userFullName[0],
      lastName: userFullName[1],
      email: user_email,
      password: user_password,
      avatar: avatar,
      repeat: user_password_repeat,
    };
    
    if (!!!userData.lastName) userData.lastName = "";

    const { statusCode, body } = await request.post({
      url: `${API_URL}/user/register`,
      json: true,
      body: userData,
    });

    if (statusCode === HttpCode.CREATED) {
      return res.redirect(`/login`);
    }

    return res.render(`sign-up`, {
      userData: {
        name: [userData.firstName, userData.lastName],
        email: userData.email,
        avatar: userData.avatar,
      },
      errorsArr: body.details,
      userAlreadyExist: body.userAlreadyExist,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoginPage = (req, res, next) => {
  try {
    if (req.cookies.user_accessToken) return res.redirect('/');
    res.render(`login`, {
      userData: {
        id: req.cookies.user_id,
        firstName: req.cookies.user_firstName,
        lastName: req.cookies.user_lastName,
        email: req.cookies.user_email,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.postLoginPage = async (req, res, next) => {
  try {
    const { user_email, user_password } = req.body;
    const userData = {
      email: user_email,
      password: user_password,
    };

    const { statusCode, body } = await request.post({
      url: `${API_URL}/user/login`,
      json: true,
      body: userData,
    });
    if (statusCode === HttpCode.OK) {
      const { accessToken, refreshToken, userData } = body;
      const { id, avatar } = userData;

      setUserCookie(refreshToken, accessToken, id, avatar, res);
    }
    return res.render("login", {
      errorsArr: body.details,
      userNotFound: body.userNotFound,
      userData: { email: userData.email },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLogout = async (req, res, next) => {
  try {
    if (!req.cookies.user_refreshToken) {
      clearUserCookie(res);
    }
    if (!req.cookies.user_accessToken && req.cookies.user_refreshToken) {
      const { statusCode, body } = await request.post({
        url: `${API_URL}/user/refresh`,
        json: true,
        headers: {
          token: `${req.cookies.user_refreshToken}`,
        },
      });
      if (statusCode === HttpCode.OK) {
        const { accessToken } = body;
        const { statusCode } = await request.delete({
          url: `${API_URL}/user/logout`,
          json: true,
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });
        if (statusCode === HttpCode.NO_CONTENT) {
          clearUserCookie(res);
        } else {
          return res.redirect("back");
        }
      }
      return res.redirect("back");
    }
    const { statusCode } = await request.delete({
      url: `${API_URL}/user/logout`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
    });
    if (statusCode === HttpCode.NO_CONTENT) {
      clearUserCookie(res);
    } else {
      return res.redirect("back");
    }
  } catch (error) {
    next(error);
  }
};

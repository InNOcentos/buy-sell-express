"use strict";

const { request } = require(`../request`);
const { HttpCode } = require(`../../constants`);
const { API_URL } = require(`../../constants`);
const { setUserCookie, clearUserCookie, ifUserAuthorisedCheck, getNewAccessToken } = require(`../helpers/jwt-helper`);
const { createPaginationPages } = require(`./utils`);
const { page_pagination } = require('./constants')


exports.getMyPage = async (req, res, next) => {
  const { page } = req.query;
  const currentPage = page ? Number.parseInt(page, 10) : page_pagination.DEFAULT_PAGE;
  const offset = (currentPage - 1) * page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE;

  let offers = [];
  let offersQuantity = 0;

  try {
    ifUserAuthorisedCheck(req,res,clearUserCookie,setUserCookie);

    const { statusCode, body } = await request.get({
      url: `${API_URL}/offers/my?offset=${offset}&limit=${page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
    });
    if (statusCode === HttpCode.OK) {
      
      offers = body.offers;
      offersQuantity = body.quantity;
    }
    if (statusCode === HttpCode.FORBIDDEN) {
      getNewAccessToken(req,res,setUserCookie);
    }
    
    
  } catch (error) {
    return next(error);
  }

  const pagesQuantity = Math.ceil(
    offersQuantity / page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE || 1 / page_pagination.OFFERS_LIMIT_QUANTITY_ON_PAGE
  );
  const pages = createPaginationPages({ quantity: pagesQuantity, currentPage });

  return res.render(`my-tickets`, {
    offers,
    currentPage,
    pages,
    userData: {
      id: req.cookies.user_id,
      avatar: req.cookies.user_avatar,
    },
  });
};

exports.getMyComments = async (req, res, next) => {
  try {
    ifUserAuthorisedCheck(req,res,clearUserCookie,setUserCookie);

    const { statusCode, body } = await request.get({
      url: `${API_URL}/offers/my?limit=${page_pagination.OFFERS_COMMENTS_LIMIT_QUANTITY_ON_PAGE}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
    });
    const offers = statusCode === HttpCode.OK ? body.offers : [];

    if (statusCode === HttpCode.FORBIDDEN) {
      getNewAccessToken(req,res,setUserCookie);
    }

    const userOffersIds = offers.map(({ id }) => id);
    const commentRequests = userOffersIds.map((id) =>
      request.get({
        url: `${API_URL}/offers/${id}/comments`,
        json: true,
      })
    );
    const commentResponses = await Promise.all(commentRequests);
    const userComments = commentResponses.map(
      ({ statusCode: commentsStatusCode, body: commentsBody }) =>
        commentsStatusCode === HttpCode.OK ? commentsBody : []
    );

    res.render(`comments`, {
      offers,
      userComments,
      userData: {
        id: req.cookies.user_id,
        avatar: req.cookies.user_avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.postMyPage = async (req, res, next) => {
  try {
    const { offerId } = req.body;
    const {statusCode} = await request.delete({
      url: `${API_URL}/offers/${offerId}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
    });

    if (statusCode === HttpCode.OK) {
      return res.redirect(`/my`);
    }
    if (statusCode === HttpCode.UNAUTHORIZED || statusCode === HttpCode.FORBIDDEN) {
      ifUserAuthorisedCheck(req,res,clearUserCookie,setUserCookie);
    }
    
    
    return res.render(`errors/500`);
    
  } catch (error) {
    next(error);
  }
};

exports.postMyComments = async (req, res, next) => {
  try {
    const { offerId, commentId } = req.body;

    const {statusCode} = await request.delete({
      url: `${API_URL}/offers/${offerId}/comments/${commentId}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      },
    });

    if (statusCode === HttpCode.OK) {
      return res.redirect(`/my/comments`);
    }
    if (statusCode === HttpCode.UNAUTHORIZED || statusCode === HttpCode.FORBIDDEN) {
      ifUserAuthorisedCheck(req,res,clearUserCookie,setUserCookie);
    }
    
    
    return res.render(`errors/500`);
  } catch (error) {
    next(error);
  }
};

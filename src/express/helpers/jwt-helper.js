"use strict";

const { request } = require(`../request`);
const { HttpCode, API_URL } = require(`../../constants`);
const { cookieStorageTime } = require('../controllers/constants')

exports.setUserCookie = (refreshToken,accessToken,id,avatar,res) => {
  return res
    .cookie(`user_refreshToken`, `${refreshToken}`, { maxAge: cookieStorageTime.refreshToken, sameSite: true })
    .cookie(`user_accessToken`, `${accessToken}`, { maxAge: cookieStorageTime.normalStorageTime, sameSite: true })
    .cookie(`user_id`, `${id}`, { maxAge: cookieStorageTime.normalStorageTime, sameSite: true })
    .cookie(`user_avatar`, `${avatar}`, { maxAge: cookieStorageTime.normalStorageTime, sameSite: true })
    .redirect("back")
};

exports.clearUserCookie = (res) => {
  return res
    .clearCookie("user_accessToken")
    .clearCookie("user_refreshToken")
    .clearCookie("user_id")
    .clearCookie("user_avatar")
    .redirect("/");
};

exports.ifUserAuthorisedCheck = async (req,res,cb1,cb2) => {
  try {
    if(!req.cookies.user_accessToken && !req.cookies.user_refreshToken) {
      cb1(res);
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
        const { accessToken, refreshToken, userData } = body;
        const { id, avatar } = userData;
        cb2(refreshToken, accessToken, id, avatar, res);
      }
      
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error)
  }
}

exports.getNewAccessToken = async (req,res,cb) => {
  try {
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
      cb(refreshToken, accessToken, id, avatar, res);
    }
    return res.redirect("/login");
  } catch (error) {
    console.log(error)
  }
}

exports.ifIsUserOfferCheck = async (req,res, id) => {
  try {
    const offer_id = id; 
    const { statusCode, body } = await request.get({
      url: `${API_URL}/user/check?q=${offer_id}`,
      json: true,
      headers: {
        authorization: `Bearer ${req.cookies.user_accessToken}`,
      }
    });
    if (statusCode === HttpCode.OK) {
      const match = body;
      
      if (match !== true) {
        return res.redirect('/');
      }
    }
  } catch (error) {
    console.log(error)
  }
}
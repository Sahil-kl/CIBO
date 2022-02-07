const express = require('express');
const controller = require('../controller/controller')

const multipart = require('connect-multiparty')
let multipartmiddle = multipart();


const middleware = require('../middlewares/middleware');
const sellerUploads=require('../multers/sellerMulter')
const itemUploads  =require('../multers/itemMulter')
const profileUploads = require('../multers/profileMulter')



let route = express.Router();




//API

route.post('/api/user/login',controller.login);

route.post('/api/user/signup',controller.signUp);

route.post('/api/user/signUp_seller',sellerUploads,middleware.authorization,controller.signUp_seller);

route.get('/api/user/get-profile',middleware.authorization,controller.profile);

route.post('/api/user/update',profileUploads,middleware.authorization,controller.update);

route.post('/api/user/change-password',middleware.authorization,controller.changepassword)

route.post('/api/user/forget-password',controller.forget_password)

route.get('/api/user/confirm-password/:email',controller.confirm_password)

route.post('/api/user/forget-change-password',controller.forget_change_password)

route.post('/api/user/add-category',controller.add_category)

route.post('/api/user/add-item',itemUploads,middleware.authorization,controller.add_item)

route.get('/api/user/get-category',middleware.authorization,controller.get_category)

route.get('/api/user/get-item',middleware.authorization,controller.get_item)

route.get('/api/user/search-item',controller.search_item)

route.get('/api/user/getItemByDistance',controller.getNearByItems) 

route.get('/api/user/logout',middleware.authorization,controller.logout)

route.post('/api/user/cart/:name',controller.addToCart)




module.exports=route;

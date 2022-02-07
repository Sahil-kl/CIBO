const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    seller_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'customers',
        required:true,
        
    },
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'items',
        required:true,
        
    },
    price:{
        type:String
    },
    item_picture:{
        type:String
    }

});

const cartItem = new mongoose.model("Cart",cartSchema);


module.exports = cartItem;
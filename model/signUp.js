const mongoose = require('mongoose');




let schema = mongoose.Schema({


    //------------CUSTOMER---------------

    name:{
        type: String,
        required:true
    },

    email:{
        type: String,
        unique: [true],
        required:true
    },
    phone:{
        type: Number,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true
    },
    confirmPassword:{
        type: String,
        required:true
    },
    deliverOption:{
        type:String,
        enum:['delivery','pickup'],
        default:'delivery'
    },
    location:{
        type: {
            type :String,
          enum: ["Point"],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    profile_picture:{
        type:String
    },
    lat:{
        type:Number
    },
    lng:{
        type:Number
    },
   

    // ---------SELLER-------------

   


  seller:{
     
     picture:{
        type:String,
       
    },
    pan_number:{
        type : String,
        unique:[true,"Pan number is already registered with another id"]
       
    },
    pan_picture:{
        type:String,
    },

    adhaar_front:{
        type: String
    },
    adhaar_back:{
        type:String
    },
    address:{

            street_name:{
            type:String,
            },
            city:{
            type:String
            },
            state:{
            type:String
            },
            pin:{
            type:String
            }
        }
  },


});


schema.index({ location: "2dsphere" },{sparse:true})
let customer = mongoose.model('customer',schema);


module.exports=customer;

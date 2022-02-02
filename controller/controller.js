const customer = require('../model/signUp')
const category= require('../model/categories')
const Item = require('../model/items')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const { body , validationResult} = require('express-validator')

const nodemailer=require('nodemailer')





exports.login=[ 
    body('email').exists().withMessage('Please enter your Email')
        .isEmail().withMessage('Invalid email address'),

    body('password').exists().withMessage('Please enter your Password'),

    
    (req,res)=>{


        const errors=validationResult(req);

        if(!errors.isEmpty()){
            res.send({
                status: 400,
                message: errors.array()
            });

        }
else{
    customer.findOne({email : req.body.email}).exec()
    .then(user=>{
       //  if(!user){
       //      res.status(400).json(" user not Found")
       //  }
       bcrypt.compare(req.body.password, user.password, (err, result,)=>{
   
             if(!result){
                    res.status(401).json('Incorrect password');
            }
            else{
   
   
                const token = jwt.sign(
                { 
                    
                    id :user._id,
    
                },
                'SecretString',
                {
                    expiresIn:"12hr"
                }
                )
               
   
            res.status(200).json({
                // name : user.name,
                // email : user.email,
                // phone: user.phone,
                token:token
                
            })
   
        }
   
       });
   
    }).catch(err =>{
        res.send("Could not entered")
    })
}

}
]



exports.signUp= [
    body('name').exists().withMessage('Please enter your Name'),
    body('email').exists().withMessage('Please enter your Email')
    .isEmail().withMessage("Invalid email"),
    body('password').exists().withMessage('Please enter your Password'),
    body('phone').exists().withMessage('Please enter your Phone Number'),

(req,res)=>{

        const errors=validationResult(req);

        if(!errors.isEmpty()){
            res.send({
                status: 400,
                message: errors.array()
            });
        }


    else{

    console.log(req.files)
    bcrypt.hash(req.body.password, 10,(err,hash)=>{
        

        if(err){
            res.status(500).json({
                error:err
            })
        }
        else{
            console.log(req.files)

            
            var user = new customer({    
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                password:hash,
                confirmPassword:hash,
               // loc: { type: "Point", coordinates: [ parseFloat(req.body.lng), parseFloat(req.body.lat) ] },
               lat:parseFloat(req.body.lat),
               lng:parseFloat(req.body.lng),
               location:{ type: 'Point', coordinates: [ req.body.lng, req.body.lat] }
                             
            });

           if(req.body.password==req.body.confirmPassword){
                user
                .save(user).then(data=>{

                    if(data){
                        // res.render('index');
                        
                        res.status(200).json({
                            new_user:data,
                            message: "data added"

                        })
                    }
                    else{
                        res.status(500);
                    }


                  }).catch(err=>{
                     console.log(err);
                })
         }
         else{
             res.status(500).send("Confirm password is not matched");
         }

        }
    })
 
    }

}
]



 exports.signUp_seller=[

    body('pan_number').exists().withMessage('Please enter your Pan Card number')
                      .withMessage('this pan card is already in use'),



    (req,res)=>{

    const errors=validationResult(req);

    if(!errors.isEmpty()){
        res.send({
            status: 400,
            message: errors.array()
        });
    }

    else{
        console.log('req.currentUser',req.currentUser)

        customer.updateOne({_id:req.currentUser},{

        seller:{       

            picture: req.files['picture'][0].filename,
            pan_number:req.body.pan_number,
            pan_picture:req.files['pan_picture'][0].filename,
            adhaar_front:req.files['adhaar_front'][0].filename,
            adhaar_back:req.files['adhaar_back'][0].filename,
            address:{
                street_name:req.body.street_name,
                city:req.body.city,    
                state: req.body.state,
                pin:req.body.pin
                }
  
            }
        }).then(data =>{

            if(data){

                // res.render('index');
                res.status(200).json({
                message: "data added"
                    })

                }

            else{

            res.status(500);
            }
        
        }).catch(err=>{
             res.status(200).json({
                 message: err
                })
            })

    }
}
]
 


exports.profile=(req,res)=>{

        customer.findOne({_id : req.currentUser})
        .then(data=>{
            res.status(200).json({
                name:data.name,
                email:data.email,
                phone:data.phone,
                picture:data.picture,
                city:data.city,
                state:data.state
                })

            })
        .catch(err=>{
            res.status(401).send(err);
            })
}



exports.update=(req,res)=>{

    let id = req.currentUser
    
    customer.findByIdAndUpdate(id,{$set:{

       // profile_picture: req.file.length ? req.file.filename:" ",
        name:req.body.name,
        phone:req.body.phone,
        "seller.pan_number":req.body.pan_number,
        "seller.address.street_name":req.body.street_name,
        "seller.address.city":req.body.city,    
        "seller.address.state": req.body.state,
        "seller.address.pin":req.body.pin,
        profile_picture: (!req.files || Object.keys(req.files).length === 0)? "":req.files['profile_picture'][0].filename 
       
        

    }},{useFindandModify:false ,new:true})
    .then(data=>{
        
        res.status(200).json(data);  
        })

    .catch(err=>{
        res.status(401).send(err);
        })
}




exports.changepassword=[
    body('password').exists().withMessage('Please enter your Password'),
    body('old_password').exists().withMessage('Please enter your Password'),
    body('confirmPassword').exists().withMessage('Fill your confirm password'),
    
    (req,res)=>{

        const errors=validationResult(req);

        if(!errors.isEmpty()){
            res.send({
                status: 400,
                message: errors.array()
            });

        }

        else{

            let id= req.currentUser

            customer.findOne({_id : id})
            .then(data=>{
        
                bcrypt.compare(req.body.old_password,data.password,(err,result)=>{

                    if(!result){
                        res.json({message:'Old password is incorrect'})
                    }
        
                    else{ 

                        if(req.body.password===req.body.old_password){
        
                            res.json({message:'Old and New password both are same'})
                        }
        
                        else{
                            
                            if(req.body.password===req.body.confirmPassword){

                                let bodydata ={
                                    password:req.body.password,
                                    confirmPassword:req.body.confirmPassword
                                }
                                bcrypt.hash(bodydata.password,10,(err,hash)=>{

                                if(err){
                                    console.log(err)
                                }
                                
                                else{
                                    console.log(hash)
                                    bodydata.password= hash,
                                    bodydata.confirmPassword=hash
 
                                     customer.findByIdAndUpdate(id,bodydata,{new:true, useFindandModify:false})
                                    .then(data=>{
                                        res.status(200).json({
                                            
                                            message:"Password is changed ",
                                            Data: data
                                            
                                        })
                                    })
                                    .catch(err=>{
                                        res.status(401).json({
                                            message:'Catch fired '
                                        })
                                    }) 
                                }
                            }) 

                        }
                        else{
                            res.status(400).json({
                                message:'Password and confirmPassword is not matched'
                            })
        
                        }
                     }
                 }
             })
        
        
            })
            .catch(err=>{
                res.status(401).send(err);
            })       
    }   
}
]



exports.forget_password=[
    body('email').exists().withMessage('Please enter your Email')
    .isEmail().withMessage(' Invalid email address'),
    
    (req,res)=>{

        const errors=validationResult(req);

        if(!errors.isEmpty()){
            res.send({
                status: 400,
                message: errors.array()
            });

        }


        else{

            console.log(req.body.email)
            let email= req.body.email

            // The original utf8 string
            let originalString = req.body.email;
  
            // Create buffer object, specifying utf8 as encoding
            let bufferObj = Buffer.from(originalString, "utf8");
  
            // Encode the Buffer as a base64 string
            let base64String = bufferObj.toString("base64");
  
            console.log("The encoded base64 string is:", base64String);
        
            customer.findOne({email: email}).then(data=>{
                if(data){
        
                    let transport = nodemailer.createTransport({
                        port:2525,
                    
                        host: 'smtp.mailtrap.io',
                      auth:{
                        user: '40d7706843bef2',
                        pass: 'ffb6a55e978800'
                      }
                       })
                    
                    
                       let mailOptions = {
                    
                           from:'sfs.priyanka19@gmail.com',
                           to:req.body.email,
                    
                           subject:'FORGET PASSWORD',
                           html:'Click on this link to change your passsword <a href=http://localhost:3030/api/user/confirm-password/'+ base64String +'>CLICK</a>'
                       }
                    
                    
                       transport.sendMail(mailOptions,(err,result)=>{
                           console.log("static error.......",err)
                           
                           if(err){
                    
                               res.json({
                                
                                   message:'Mail not sent',
                                   Error: err
                               })
                           }
                           else{
                               res.status(200).json({
                                   message:'Mail has been sent to your E-mail account '
                               })
                           }
                       })
        
                }
                else{
                    res.status(400).json({
                        message:"user not found "
                    })
                }
            })
        }



   

  
}
]



exports.confirm_password=(req,res)=>{



        res.render('newPassword',{email : req.params.email});
}



exports.forget_change_password=[
    body('name').exists().withMessage('Please enter your Name'),
    
    (req,res)=>{


        console.log(req.body.currentemail)

        
// The base64 encoded input string
let base64string =req.body.currentemail ;
  
// Create a buffer from the string
let bufferObj = Buffer.from(base64string, "base64");
  
// Encode the Buffer as a utf8 string
let decodeEmail = bufferObj.toString("utf8");
  
console.log("The decoded string:", decodeEmail);


let bodydata ={
    password:req.body.password,
    confirmPassword:req.body.confirmPassword
}



bcrypt.hash(bodydata.password,10,(err,hash)=>{

    if(err){
        console.log(err)
    }

        console.log(hash)
       bodydata.password= hash,
       bodydata.confirmPassword=hash



       customer.updateOne({email: decodeEmail},bodydata,{new:true, useFindandModify:false})
       .then(data=>{
           res.status(200).json({
               
               message:"Password is changed ",
               Data: data
               
           })
       })
       .catch(err=>{
           res.status(401).json({
               message:'Catch fired '
           })
       }) 
    
})
    
    }
]



exports.add_category=[
    body('cat_name').exists().isLength({min:3}).withMessage('Category name cannnot be empty and should contain 3 characters atleast'),
    
    (req,res)=>{

        const errors=validationResult(req);

        if(!errors.isEmpty()){
            res.send({
                status: 400,
                message: errors.array()
            });
        }

        else{


            let newCat = new category({
                name:req.body.cat_name
            });
         
            newCat.save(newCat)
            .then(data=>{
                res.status(200).json({
                    message:"category is added",
                    name:data
                })
            })
            
            .catch(err=>{
                res.status(400).json({
                   Error:err
                })
            })
        
        }
}
]



exports.add_item=[
    body('item_name').exists().isLength({min:3})
    .withMessage('Item name cannot be empty and must contain 3 characters atleast'),

    body('cat_name').exists().withMessage('Select category for this item'),
    
    (req,res)=>{
        
        const errors=validationResult(req);

    if(!errors.isEmpty()){
        res.send({
            status: 400,
            message: errors.array()
        });
    }

    else{
            
    category.findOne({ name: req.body.cat_name})
    .then(data=>{

       if(!data){
        res.status(200).json({
            message:"Category not found"
        })
       }

       else{
           console.log(req.files.length)
            cat_id = data._id
            let newItem2= new Item({
                name: req.body.item_name,
                category_id :cat_id,
                seller_id:req.currentUser,
                price:req.body.price,
                item_picture: (!req.files || Object.keys(req.files).length === 0)? "":req.files['item_picture'][0].filename 
            })


            newItem2.save(newItem2)
            .then(data=>{
                res.status(201).json({
                    message:"New item has been added",
                    Data:data
                })
        
            })
            .catch(err=>{
                res.json({
                    Error:err
                })
            })
        }

       
    })
    .catch(err=>{
        res.status(200).json({
            Error:err
        })
    })

    }
}
]



exports.get_category=(req,res)=>{

    category.find()
    .then(data=>{
        if(data){
            res.status(200).json({
                Data:data
            })
        }
        else{
            res.status(400).json({
                message:"data not found"
            })
        }
    })
    .catch(err=>{
        res.status(400).json({
            Error:err
        })
    })
}



exports.get_item=(req,res)=>{

console.log("Currebt user.........",req.currentUser)
    
    Item.find({seller_id:req.currentUser})
        .then(data=>{
            if(data){
                res.status(200).json({
                Data:data
                })
            }
            else{
            res.status(400).json({
                message:"data not found"
                })
            }
        })
        .catch(err=>{
            res.status(400).json({
            Error:err
            })
        })  
}



exports.search_item=(req,res)=>{

    Item.find({"name": {"$regex": ""+req.body.text+"", $options: 'i'}})
    .then(data=>{
        res.status(200).json({
            message:"Data found",
            Data:data
        })
    })
    .catch(err=>{
        res.json({
            Error:err
        })
    })
}


exports.getNearByItems=(req,res)=>{
    try{

        Item.aggregate([
            {
                $lookup:{
                    from:"customers",
                    let :{ "sellerId":"$seller_id" },
                    pipeline:[
                        {
                        $geoNear:{
                            near: {type: "Point", coordinates: [ parseFloat(req.body.lng), parseFloat(req.body.lat)]},
                            distanceField: "dist.calculated",
                            minDistance:700,
                            maxDistance:1000,
                            includeLocs: "dist.location",
                            spherical: true
                                    }
                        },
                        {
                        $match:{
                            $expr:{  $eq:["$_id","$$sellerId"]  }
                                }
                        }
                                
                        ],

                    as: "Seller"
                    }
                },
                        {
                            $unwind:"$Seller"
                        },
                        {
                            $project:{
                                "seller_name":'$Seller.name',
                                "Distance":"$Seller.dist.calculated",
                               // _id:1,
                                //item:1,
                                //category_id:1,
                                //seller_id:1,
                                image:1,
                                price:1,
                                name:1
                            
                            }
                        },{
                            $sort:{
                               "Distance" :1
                            }
                        } 
        ])
        .then(success=>{
            
            return res.status(200).json({
                data:success
            })

        }).catch(err=>{
            return res.status(400).json({
                err:err
            })
        })

    }catch(error)
    {
        return res.status(400).json({
            err:error

    })
}
}

exports.logout=(req,res)=>{
    let token= req.headers.authorization;

    jwt.destroy(token,'SecretString').then(data=>{
        if(data){
            res.status(200).json({
                message:"You are logged out"
            })
        }
    }).catch(err=>{
        res.status(400).json({
            Error:err
        })
    })
}
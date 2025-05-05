const joi = require("joi");

module.exports.listingSchema = joi.object({
    listings : joi.object({
        title : joi.string().required() ,
        description : joi.string().required() ,
        country : joi.string().required() ,
        price : joi.number().required().min(0) ,
        location : joi.string().required() ,
        image : joi.string().allow("" , null) ,

    }).required()
})

module.exports.reviewSchema = joi.object({
    reviews : joi.object({
        rating : joi.number().required().min(1).max(5) ,
        comment : joi.string().required()
    }).required()
})

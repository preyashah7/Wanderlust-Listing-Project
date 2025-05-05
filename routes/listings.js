const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpresssError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req , res , next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        throw new ExpresssError(400 , error);
    } else {
        next();
    }
}

router.route("/")
.get( wrapAsync (listingController.index))
.post(isLoggedIn , upload.single('listings[image]') , validateListing , wrapAsync (listingController.createListing))

router.get("/new" , isLoggedIn , listingController.renderCreateListing )

router.route("/:id")
.get( wrapAsync (listingController.renderShow) )
.put( isLoggedIn , isOwner , upload.single('listings[image]'),validateListing , wrapAsync (listingController.update))
.delete(isLoggedIn , isOwner, wrapAsync (listingController.destroy) )

router.get("/:id/edit" ,isLoggedIn ,isOwner, wrapAsync (listingController.renderEdit))
   

module.exports = router;
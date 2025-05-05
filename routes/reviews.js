const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpresssError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const {isLoggedIn , isReviewOwner} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req , res , next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpresssError(400 , error);
    } else {
        next();
    }
}

// Review Route

router.post("/" , isLoggedIn ,  validateReview , wrapAsync (reviewController.createReview))

// Review Delete Route

router.delete("/:reviewId",isLoggedIn , isReviewOwner , wrapAsync(reviewController.destroyReview))

module.exports = router;
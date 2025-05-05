const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req , res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs" , {allListings});
}

module.exports.renderCreateListing = (req,res) => {
    res.render("./listings/new.ejs")
}

module.exports.renderShow = async(req , res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews" , populate : "author"}).populate("owner");
    if (!listing) {
     req.flash("error" , "No such listing exists");
     res.redirect("/listings");
    }
    res.render("./listings/show.ejs" , {listing} );
}

module.exports.createListing = async(req , res , next)  => {

    let respone = await geocodingClient.forwardGeocode({
        query: req.body.listings.location ,
        limit: 1
      })
        .send()

    let url = req.file.path ;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listings);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};
    newListing.geometry = respone.body.features[0].geometry;
    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success" , "New Listing Added Succesfully");
    res.redirect("/listings")
}

module.exports.renderEdit = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
     req.flash("error" , "No such listing exists");
     res.redirect("/listings");
    }
    // let originalImageUrl = listing.image.url;
    // listingImageUrl = originalImageUrl.replace("upload" , "/upload/h_150,w_150");
    res.render("./listings/edit.ejs" , {listing});
}

module.exports.update = async(req , res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listings});
    if (typeof req.file !== "undefined") {
        let url = req.file.path ;
        let filename = req.file.filename;
        listing.image = {url , filename}
        await listing.save();
    }
    req.flash("success" , "Listing Updated Succesfully");
    res.redirect(`/listings/${id}`);
}

module.exports.destroy = async(req , res) => {
    let {id} = req.params;
    let deletelisting = await Listing.findByIdAndDelete(id);
    console.log(deletelisting);
    req.flash("success" , "Listing Deleted Succesfully");
    res.redirect("/listings");
}

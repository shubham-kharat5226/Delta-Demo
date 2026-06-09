const express = require("express");
const router = express.Router(); // capital R
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { validateReview } = require("../middleware.js");
const listingsController = require("../controllers/listings.js");

const multer  = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
  .get(wrapAsync(listingsController.index))
  .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingsController.createListing),);

// NEW ROUTE - must come before /:id route
router.get("/new", isLoggedIn, listingsController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingsController.showListings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingsController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destoryListing));

// EDIT ROUT
router.get("/:id/edit", isLoggedIn, isOwner, listingsController.renderEditForm);

module.exports = router;
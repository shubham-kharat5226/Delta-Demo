const Listing = require("../models/listing");
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN || process.env.MAP_TOKEN;
const geocodingClient = mapBoxToken
  ? mbxGeocoding({ accessToken: mapBoxToken })
  : null;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", { listing: {} });
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send("Invalid listing ID");
  }
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing requisted for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
  if (!geocodingClient) {
    req.flash("error", "Mapbox access token is not configured.");
    return res.redirect("/listings/new");
  }

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  if (!response.body.features || response.body.features.length === 0) {
    req.flash(
      "error",
      "Could not find the location. Please enter a valid location.",
    );
    return res.redirect("/listings/new");
  }

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  console.log(newListing);
  req.flash("success", "Listing created successfully");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send("Invalid listing ID");
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing requisted for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/uploads/", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!geocodingClient) {
    req.flash("error", "Mapbox access token is not configured.");
    return res.redirect(`/listings/${req.params.id}/edit`);
  }

  let { id } = req.params;
  let listing = await Listing.findById(id);

  // Check if location has changed, if so, update geometry
  if (
    req.body.listing.location &&
    req.body.listing.location !== listing.location
  ) {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (!response.body.features || response.body.features.length === 0) {
      req.flash(
        "error",
        "Could not find the location. Please enter a valid location.",
      );
      return res.redirect(`/listings/${id}/edit`);
    }

    req.body.listing.geometry = response.body.features[0].geometry;
  }

  listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true },
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destoryListing = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send("Invalid listing ID");
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

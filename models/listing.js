const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: {
      url: String,
      filename: String,
    },
    price: {
      type: Number,
      required: true,
    },
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
    
  },

  { timestamps: true },
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
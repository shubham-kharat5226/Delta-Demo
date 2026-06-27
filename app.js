if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routers/listings.js");
const reviewRouter = require("./routers/review.js");
const userRouter = require("./routers/user.js");

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET || "major-project-secret";

if (!dbUrl) {
  console.error("Error: ATLASDB_URL environment variable is not set.");
  console.error(
    "On Render: go to your service → Environment → add ATLASDB_URL with your MongoDB connection string."
  );
  console.error(
    "Example: mongodb+srv://<USER>:<PASSWORD>@cluster0.mongodb.net/<DBNAME>?retryWrites=true&w=majority"
  );
  process.exit(1);
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:");
    console.error("- Confirm the Render `ATLASDB_URL` environment variable contains the correct username and password.");
    console.error("- If your password contains special characters, URL-encode them (e.g. @ -> %40).");
    console.error("- See README.md for Render setup steps.");
    console.error(err);
    process.exit(1);
  });

async function main() {
  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 5000,
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

let MongoStore = require("connect-mongo");
if (MongoStore && typeof MongoStore.create !== "function" && MongoStore.default) {
  MongoStore = MongoStore.default;
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Somthing went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server start on port : 8080");
})
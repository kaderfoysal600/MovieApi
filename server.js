const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Set up Express.js
const app = express();
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect("mongodb://0.0.0.0:27017/movies_database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define database models and schemas
const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: String,
    runtime: Number,
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
    director: { type: mongoose.Schema.Types.ObjectId, ref: "Director" },
    producer: { type: mongoose.Schema.Types.ObjectId, ref: "Producer" },
    releaseDate: Date,
    posterImage: String,
  })
);

const Actor = mongoose.model(
  "Actor",
  new mongoose.Schema({
    name: String,
  })
);

const Director = mongoose.model(
  "Director",
  new mongoose.Schema({
    name: String,
  })
);

const Producer = mongoose.model(
  "Producer",
  new mongoose.Schema({
    name: String,
  })
);

const Review = mongoose.model(
  "Review",
  new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    content: String,
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
  })
);

// Set up authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "manarat600");
    req.user = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Define routes

// Endpoint to get all movies and TV shows
app.get("/api/movies", authenticateUser, async (req, res) => {
  try {
    const movies = await Movie.find().populate("actors director producer");
    res.json(movies);
  } catch (err) {
    console.error("Error retrieving movies:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to get a single movie or TV show by ID
app.get("/api/movies/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id).populate("actors director producer");
    if (!movie) {
      return res.status(404).json({ message: "Movie or TV show not found" });
    }

    res.json(movie);
  } catch (err) {
    console.error("Error retrieving movie:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to create a new movie or TV show (admin only)
app.post("/api/movies", authenticateUser, async (req, res) => {
  const {
    title,
    runtime,
    actors,
    director,
    producer,
    releaseDate,
    posterImage,
  } = req.body;

  // Check if user is an admin (you need to implement user roles and admin authentication)

  try {
    const movie = await Movie.create({
      title,
      runtime,
      actors,
      director,
      producer,
      releaseDate,
      posterImage,
    });
    res.status(201).json(movie);
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to get all reviews for a particular movie or TV show
app.get("/api/movies/:id/reviews", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await Review.find({ movie: id })
      .populate("user", "username")
      .select("user rating content");
    res.json(reviews);
  } catch (err) {
    console.error("Error retrieving reviews:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

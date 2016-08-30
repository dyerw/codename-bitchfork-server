const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = mongoose.Schema({
  created: Date,
  user: ObjectId,
  albumName: String,
  albumMbid: String,
  albumArtUrl: String,
  artistName: String,
  relatedArtists: [String],
  moods: [String],
  writingScore: Number,
  discoveryScore: Number,
  reviewText: String,
  trackPickName: String,
  trackPickMbid: String,
  genres: [String]
});

module.exports = mongoose.model('Review', reviewSchema);

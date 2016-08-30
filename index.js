const koa = require('koa');
const koaBetterBody = require('koa-better-body');
const logger = require('koa-logger');
const jwt = require('koa-jwt');
const router = require('koa-route');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('./models/user');
const Review = require('./models/review');

const app = koa();

const SECRET = process.env.NODE_JWT_SECRET || "secret";

// Mongo Config
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_HOST);

// Middleware
app.use(logger());
app.use(koaBetterBody());
app.use(jwt({ secret: SECRET, passthrough: true }));

// Create A User
app.use(router.post('/user', function *() {
  let user = new User({
    username: this.request.fields.username,
    password: bcrypt.hashSync(this.request.fields.password, 10)
  });
  user.save();
}));

// Authenticate A User
app.use(router.get('/auth', function *() {
  let userDocument = yield User.find({ username: this.request.query.username }).exec();
  if (userDocument.length == 0) {
    this.status = 404;
    this.body = { error: 'username does not exist' };
    return ;
  }

  userDocument = userDocument[0];

  if(bcrypt.compareSync(this.request.query.password, userDocument.password)) {
    this.response.body = { token: jwt.sign({ id: userDocument._id }, SECRET) }
  } else {
    this.response.status = 401;
    this.response.body = { error: 'wrong password' };
  }
}));

// Create A Review
app.use(router.post('/review', function *() {
  if (this.state.user) {
    let review = new Review({
      created: new Date(),
      user: this.state.user.id,
      albumName: this.request.fields.albumName,
      albumMbid: this.request.fields.albumMbid,
      albumArtUrl: this.request.fields.albumArtUrl,
      artistName: this.request.fields.artistName,
      relatedArtists: this.request.fields.relatedArtists,
      moods: this.request.fields.moods,
      writingScore: this.request.fields.writingScore,
      discoveryScore: this.request.fields.discoveryScore,
      reviewText: this.request.fields.reviewText,
      trackPickName: this.request.fields.trackPickName,
      trackPickMbid: this.request.fields.trackPickMbid,
      genres: this.request.fields.genres
    });
    yield reviewDocument = review.save();
    this.response.body = reviewDocument;
  } else {
    this.response.status = 401;
    this.response.body = { error: "not authenticated" }
  }
}));

// Fetch Review Stream
// TODO: Implement

app.listen(3070);

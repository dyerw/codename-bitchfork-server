const koa = require('koa');
const koaBetterBody = require('koa-better-body');
const logger = require('koa-logger');
const jwt = require('koa-jwt');
const router = require('koa-route');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('./models/user');

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
  let userDocument = yield User.findOne({ 'username': this.request.query.username });

  if(bcrypt.compareSync(this.request.query.password, userDocument.password)) {
    this.response.body = { token: jwt.sign({ id: userDocument._id }, SECRET) }
  } else {
    this.response.statusCode = 401;
    this.response.body = { error: 'wrong password' };
  }
}));

// Create A Review
// TODO: Implement

// Fetch Review Stream
// TODO: Implement

app.listen(3070);

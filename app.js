var morgan  = require('morgan');
var express = require('express');
var bodyParser = require("body-parser");
var ejs = require("ejs");
var app     = express();
var port    = process.env.PORT || 3000;
var router  = express.Router();
var server  = require('http').createServer(app);
var stream = null;
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', './views');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));

router.get('/', function(req, res) {
  io.on('connect', function(socket) {
    socket.on("search", function(searchTerm){
      if(searchTerm){
        stream = twitter.stream('statuses/filter', { track: searchTerm });
        stream.on('tweet', function(tweet) {
          var data = {};
          data.name = tweet.user.name;
          data.screen_name = tweet.user.screen_name;
          data.text = tweet.text;
          data.profile_image_url = tweet.user.profile_image_url;
          socket.emit('tweet1', data);
        });
      }
    });

    socket.on("stop", function(){
      if(stream) { stream.stop() };
    })

  });
  res.render('index.html');
});

app.use('/', router);
server.listen(port);

console.log('Server started on ' + port);

var io   = require('socket.io')(server);
var Twit = require('twit');
var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY2,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET2,
  access_token: process.env.TWITTER_ACCESS_TOKEN2,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET2
});


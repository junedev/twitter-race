var morgan  = require('morgan');
var express = require('express');
var bodyParser = require("body-parser");
var ejs = require("ejs");
var sassMiddleware = require('node-sass-middleware');
var app     = express();
var port    = process.env.PORT || 3000;
var router  = express.Router();
var server  = require('http').createServer(app);
var stream1 = null;
var stream2 = null;
var currentSearch = null;
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', './views');
app.engine('html', require('ejs').renderFile);

app.use(morgan('dev'));

app.use(sassMiddleware({
  src: __dirname + '/scss', 
  dest: __dirname + '/public/css',
  debug: true,
  outputStyle: 'compressed',
  prefix: "/css"
  }),
  express.static(__dirname + '/public')
)

router.get('/', function(req, res) {
  io.on('connect', function(socket) {
    socket.on("stop", function(){
      console.log("stop received");
        stream1.stop();
        stream2.stop();
        stream1 = null;
        stream2 = null;
        currentSearch = null;
        socket.disconnect(true);
    })

    socket.on("search", function(searchTerms){
      if(!currentSearch && searchTerms){
        currentSearch = searchTerms;
        console.log(searchTerms);
        stream1 = twitter.stream('statuses/filter', { track: searchTerms.search1 });
        stream2 = twitter.stream('statuses/filter', { track: searchTerms.search2 });
        stream1.on('tweet', function(tweet) {
          var data = {};
          data.name = tweet.user.name;
          data.screen_name = tweet.user.screen_name;
          data.text = tweet.text;
          data.profile_image_url = tweet.user.profile_image_url;
          socket.emit('tweet1', data);
        });
        stream2.on('tweet', function(tweet) {
          var data = {};
          data.name = tweet.user.name;
          data.screen_name = tweet.user.screen_name;
          data.text = tweet.text;
          data.profile_image_url = tweet.user.profile_image_url;
          socket.emit('tweet2', data);
        });
      }
    });

  });
  res.render('index.html');
});

// router.post("/stop", function(req,res){
//   stream1.stop();
//   stream2.stop();
//   stream1 = null;
//   stream2 = null;
//   res.send(200);
// })

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

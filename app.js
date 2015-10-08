var morgan  = require('morgan');
var express = require('express');
var bodyParser = require("body-parser");
var sassMiddleware = require('node-sass-middleware');
var app     = express();
var port    = process.env.PORT || 9000;
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
  prefix: '/css'
  }),
  express.static(__dirname + '/public')
)

router.get('/', function(req, res) {
  io.on('connect', function(socket) {
    socket.once("stop", function(){
      if(stream1) {
        stream1.stop();
        stream1 = null;
      }
      if(stream2) {
        stream2.stop();
        stream2 = null;    
      }
      currentSearch = null;
    })

    socket.once("search", function(searchTerms){
      if(!currentSearch && searchTerms){
        currentSearch = searchTerms;
        stream1 = twitter.stream('statuses/filter', { track: searchTerms.search1 });
        stream2 = twitter.stream('statuses/filter', { track: searchTerms.search2 });
        stream1.on('tweet', function(tweet) {
          socket.emit('tweet1', formatTweetData(tweet));
        });
        stream2.on('tweet', function(tweet) {
          socket.emit('tweet2', formatTweetData(tweet));
        });
      }
    });

  });
  res.render('index.html');
});

app.use('/', router);

var io   = require('socket.io')(server);
var Twit = require('twit');
var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY2,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET2,
  access_token: process.env.TWITTER_ACCESS_TOKEN2,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET2
});

server.listen(port, function(err){
  if(err) console.log(err);
  console.log("Twitter Race running on port "+port);
});

function formatTweetData(tweet){
  var data = {};
  data.name = tweet.user.name;
  data.screen_name = tweet.user.screen_name;
  data.text = tweet.text;
  data.profile_image_url = tweet.user.profile_image_url;
  return data;
}
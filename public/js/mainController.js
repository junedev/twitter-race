angular.module("twitterRace")
.controller("MainController", MainController);

MainController.$inject = ["socket","$http","$window","Score","$scope"];

function MainController(socket,$http,$window,Score,$scope){
  var self = this;
  var intervalId = null;
  var timeoutId = null;
  self.searchTerms = {};
  self.counter1 = 0;
  self.counter2 = 0;
  self.bar = {};
  self.tweets1 = [];
  self.tweets2 = [];
  self.status = -1;
  self.countdown = 15;
  self.scores = Score.all;

  self.calcBarHeight = function(){
    self.bar = {left: self.counter1*10, right: self.counter2*10};
    if(self.counter1 > 30 || self.counter2 > 30){
      if(self.counter1>self.counter2){
        self.bar = {
          left: 300,
          right: 300*self.counter2/self.counter1
        };
      } else {
        self.bar = {
          left: 300*self.counter1/self.counter2,
          right: 300
        };
      }
    }
  };

  function listenForTweets(name, array){
    socket.on(name, function(tweet) {
      if(self.status < 2){
        self.status++;
        if(self.status === 2){
          self.status++;
          self.startCountdown();
        }
      } else {
        if(name==="tweet1") self.counter1++;
        if(name==="tweet2") self.counter2++;
        array.unshift(tweet);
        if (array.length > 10) array.pop();
      }
      self.calcBarHeight();
    });
  }

  listenForTweets("tweet1", self.tweets1);
  listenForTweets("tweet2", self.tweets2);

  self.sendSearchTerm = function(){
    self.status = 0;
    timeoutId = $window.setTimeout(function() {
      socket.emit('stop');
      $window.location.href = "/";
    }, 25000);
    socket.emit('search', self.searchTerms);
  };

  self.restart = function(){
    $window.location.href = "/";
  };

  self.startCountdown = function(){
    $window.clearTimeout(timeoutId);
    intervalId = $window.setInterval(function() {
      self.countdown--;
      $scope.$apply();
    }, 1000);
    $window.setTimeout(function() {
      self.countdown--;
      $scope.$apply();
      self.status = 5;
      socket.emit('stop');
      $window.clearInterval(intervalId);
      Score.create({
        1:[self.searchTerms.search1,self.counter1],
        2:[self.searchTerms.search2,self.counter2]
      });
    }, self.countdown*1000);
  };

}
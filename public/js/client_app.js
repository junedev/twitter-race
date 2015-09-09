angular.module("twitterRace",["firebase"])
.factory("socket", socket)
.factory("Score",Score)
.controller("MainController", MainController)
.constant("FIREBASE_URL","https://twitter-race.firebaseio.com/");

socket.$inject = ["$rootScope"]

function socket($rootScope){
  var socket = io();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}

Score.$inject = ["$firebaseArray","FIREBASE_URL"];

function Score($firebaseArray,FIREBASE_URL){
  var ref = new Firebase(FIREBASE_URL);
  var scores = $firebaseArray(ref.child("scores"));
  var Score = {};
  
  Score.all = scores;

  Score.create = function(score){
    return scores.$add(score);
  }

  Score.delete = function(score){
    return scores.$remove(score);
  }

  return Score;
}



MainController.$inject = ["socket","$http","$window","Score"]

function MainController(socket,$http,$window,Score){
  var self = this;
  var intervalID = null;
  self.searchTerms = {};
  self.searchTermsCopy = {};
  self.tweets1 = [];
  self.tweets2 = [];
  self.status = 0;
  self.counter1 = 0;
  self.counter2 = 0;
  self.bar = {};
  self.countdown = 15;
  self.scores = Score.all;

  self.calc = function(){
    self.bar = {left: self.counter1*10, right: self.counter2*10};
    if(self.counter1 > 30 || self.counter2 > 30){
      if(self.counter1>self.counter2){
        self.bar = {
          left: 300,
          right: 300*self.counter2/self.counter1
        }
      } else {
        self.bar = {
          left: 300*self.counter1/self.counter2,
          right: 300
        }
      }
    }
  }

  socket.on('tweet2', function(tweet) {
    if(self.status < 2){
      self.status++;
      if(self.status === 2){
        self.status++;
        self.startCountdown();
      }
    } else {
      self.counter2++;
      self.tweets2.unshift(tweet);
      if (self.tweets2.length > 10) self.tweets2.pop();
    }
    self.calc();
  });

  socket.on('tweet1', function(tweet) {
    if(self.status < 2){
      self.status++;
      if(self.status === 2){
        self.status++;
        self.startCountdown();
      }
    } else {
      self.counter1++;
      self.tweets1.unshift(tweet);
      if (self.tweets1.length > 10) self.tweets1.pop();
    }
    self.calc();
  });


  self.sendSearchTerm = function(){
    socket.emit('search', self.searchTerms);
    self.searchTermsCopy = self.searchTerms;
  }

  self.restart = function(){
    $window.location.href = "/";
  }

  self.startCountdown = function(){
    intervalID = $window.setInterval(function() {
      self.countdown--;
    }, 1000);
    $window.setTimeout(function() {
      socket.emit('stop');
      self.status = 5;
      $window.clearInterval(intervalID);
      Score.create({
        1:[self.searchTerms.search1,self.counter1],
        2:[self.searchTerms.search2,self.counter2]
      })
    }, 15000);
  }

}
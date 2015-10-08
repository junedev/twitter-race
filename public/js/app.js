angular.module("twitterRace",["firebase"])
.factory("socket", socketFactory)
.factory("Score",ScoreFactory)
.constant("FIREBASE_URL","https://twitter-race.firebaseio.com/");

// Source for how to wrap up socket.io:
// http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/

socketFactory.$inject = ["$rootScope"];

function socketFactory($rootScope){
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
      });
    }
  };
}

ScoreFactory.$inject = ["$firebaseArray","FIREBASE_URL"];

function ScoreFactory($firebaseArray,FIREBASE_URL){
  var ref = new Firebase(FIREBASE_URL);
  var scores = $firebaseArray(ref.child("scores"));
  var Score = {};

  Score.all = scores;

  Score.create = function(score){
    return scores.$add(score);
  };

  Score.delete = function(score){
    return scores.$remove(score);
  };

  return Score;
}
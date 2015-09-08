angular.module("twitterRace",[])
.factory("socket", socket)
.controller("MainController", MainController);

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


MainController.$inject = ["socket"]

function MainController(socket){
  var self = this;
  self.searchTerm = "";
  self.tweets1 = [];

  socket.on('connect', function() {
    console.log("Connected");
  });

  socket.on('tweet1', function(tweet) {
    self.tweets1.unshift(tweet);
    if (self.tweets1.length > 10) self.tweets1.pop();
  });

  self.sendSearchTerm = function(){
    console.log("function reached");
    socket.emit('search', self.searchTerm);
  }

  self.stopStream = function(){
    socket.emit('stop');
  }
}
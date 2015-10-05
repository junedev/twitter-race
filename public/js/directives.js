angular.module('twitterRace')
.directive("tweet", tweetDirective)
.directive("bar", barDirective)
.directive("fakebar", FakeBarDirective);

function tweetDirective(){
  var directive = {};
  directive.restrict = "E";
  directive.replace = true;
  directive.templateUrl = "./js/templates/_tweet.html";
  directive.scope = {
    tweetData: "="
  };

  return directive;
}

function barDirective(){
  var directive = {};
  directive.restrict = "E";
  directive.replace = true;
  directive.templateUrl = "./js/templates/_bar.html";
  directive.scope = {
    barData: "=",
    barLabel: "@",
    barHeight: "="
  };

  return directive;
}

function FakeBarDirective(){
  var directive = {};
  directive.restrict = "E";
  directive.replace = true;
  directive.templateUrl = "./js/templates/_fake-bar.html";
  directive.scope = {
    barLabel: "@"
  };

  return directive;
}
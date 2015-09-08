$(function(){
  var socket = io();
  var last_search = "";

  socket.on('connect', function() {
    console.log("Connected");
  });

  $("form.start").on("submit", function(){
    event.preventDefault();
    var search_term = $(this).find("input").val();
    $(this).find("input").val("");
    if(search_term){
    if(last_search.toLowerCase()!==search_term.toLowerCase()){$('#tweet-container').empty()}
      last_search=search_term;
      $("#headline").html("Twitter feed for "+search_term);
    socket.emit('search', search_term);
    }
  });

  socket.on('tweets', function(tweet) {
    var html = '<li class="well clearfix"><img src="' + 
    tweet.profile_image_url + '" class="avatar pull-left"/><div class="names"><span class="full-name">' + tweet.name + ' </span><span class="username">@' +tweet.screen_name + '</span></div><div class="contents"><span class="text">' + tweet.text + '</span></li>';
    $('#tweet-container').prepend(html);
    if($('#tweet-container').children().length > 20) { $('#tweet-container').children().last().remove()}
  });

  $("button.stop").on("click",function(){
    $.ajax({
      url: "/stop_stream",
      type: "POST"
    });
    event.preventDefault();
  });

});
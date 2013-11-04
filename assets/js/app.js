
//var xmlRoot = 'http://www.xiami.com/widget/xml-single/sid/';
var songRoot = 'http://s.centwave.com/';
    


var hami = function(searchWord, page, cb){
  var url = "http://www.xiami.com/app/nineteen/search/key/"+ encodeURIComponent(searchWord)+ "/diandian/1/page/"+ page +"?_=10&callback=xiami";
  
  $.ajax({
    type: 'GET',
    url: url,
    contentType: "application/x-javascript",
    dataType: 'jsonp',
    success: function(data){
      cb(data)
    }
  });
  
}

var decrypt = function(text){
  var rows = parseInt(text[0]);
  text = text.substring(1);
  var strlen =  text.length; 
  var cols = Math.floor(strlen / rows);
  var right_rows = strlen % rows;
  var url_true = '';

  
  for( var i=0; i<strlen; i++){
    var x = i % rows;
    var y = Math.floor(i / rows);
    var p = 0;
    if( x <= right_rows)
      p = x * (cols + 1) +y;
    else
      p = right_rows * ( cols + 1 ) + (x - right_rows ) * cols +y;

    url_true += text[p];
  }
  return decodeURIComponent(url_true).replace(/\^/g,'0');
}

var downloadLink = function(id,cb){

  $.ajax({
    type: 'GET',
    url: songRoot+id,
    dataType: "html",
    success: function(data){
      cb(decrypt(data))
    }
  });
}
//console.log(decrypt('9hFlc%32373t%eo23F32t2.mF6178pFx%2%726%mi21566_31aF6E9_lA.m2%5%3.%fi12156m2i.6F%E2p'))

// hami('方大同', 1, function(data){
//   downloadLink(data[0].song_id, function(link){
//     console.log(link);
//   })
// });

function unescapeHtml(text) {
  return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "")
      .replace(/&#039;/g, "'");
}

var keys = [37, 38, 39, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
}

var MusicModel = function() {
  var self = this;
  this.page = 1;
  this.items = ko.observableArray();
  this.hasNext = true;
  this.decodeLink = ko.observable();
  this.msg = ko.observable("Please Wait");
  this.shouldShowLoading = ko.observable(false);
  this.shouldShowPlayer = ko.observable(false);

  this.start = function(){
    window.open(this.decodeLink());
  }

  this.reset = function(){

    self.items([]);
    self.msg("Please Wait");
    self.page = 1;
    self.hasNext = true;

  }

  this.cancel = function(){

    self.shouldShowLoading(false);
    enable_scroll();
  
  }

  this.q = function() {

    self.reset();

    var $query = document.querySelector("#query");

    self.loadData($query.value);

  }


  this.download = function(obj){
    
    self.shouldShowLoading(true);
    disable_scroll();

    downloadLink(obj.song_id, function(link){
      
      self.decodeLink(link);
      self.msg("Click Me Now");
      
    });

  }

  this.play = function(obj){

    downloadLink(obj.song_id, function(link){
      
      var $player = document.querySelector("#player");
      self.shouldShowPlayer(true);
      $player.src = link;
      $player.load();
      $player.play();
      
    });

  }

  this.loadData = function(value){

    hami(value, self.page++, function(data){

      if (data.total > self.page * 10)
      {
        self.hasNext = true;
      }
      else
      {
        self.hasNext = false;
      }

      var results = data.results;

      for (var i = 0; i < results.length; i++) {
        results[i].song_name = unescapeHtml(decodeURIComponent(results[i].song_name).replace(/\+/g, " "));
        results[i].artist_name = unescapeHtml(decodeURIComponent(results[i].artist_name).replace(/\+/g, " "));
        results[i].album_name = unescapeHtml(decodeURIComponent(results[i].album_name).replace(/\+/g, " "));
        results[i].album_logo = decodeURIComponent(results[i].album_logo).replace(/\_1/g, "");
        self.items.push(results[i]);
      };

      if (self.page < 10 && self.hasNext)
      {
        self.loadData(value);
      }
    });
  }

};
 
ko.applyBindings(new MusicModel());
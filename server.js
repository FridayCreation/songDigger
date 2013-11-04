var express = require('express'),
    path = require('path'),
    http = require('http'),
    fs = require('fs');
var request = require('request');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 7000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'public')));
});

app.all('/*',function(req,res,next){
    res.setHeader('content-type','text/json; charset=UTF-8');
    res.setHeader("Access-Control-Allow-Origin", "*");
    next(); 
});

app.get('/:id', function(req,res){
  request('http://www.xiami.com/song/gethqsong/sid/'+req.params.id, function (error, response, body) {
    res.send( JSON.parse(response.body).location ) 
  });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

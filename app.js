var express = require("express");
var http = require("http");
var app = express();
var server = http.createServer(app);

app.get("/", function(req, res){
    res.redirect("https://dev-lr.com");
});

app.get("/start", function(req, res){
    res.send("start page");
});

server.listen(8080, "0.0.0.0", function(){
    console.log("Server listen on port " + server.address().port);
});
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// Set view engine
app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("landpage", {cssPath: "landpage.css"});
});

app.get("/dashboard", function(req, res){
    var players = [ {name: "林子雋", profession: 432, social: 438, money: 12, love: 2839}, 
                    {name: "黃仁愉", profession: 274, social: 233, money: 342, love: 293423}];
    res.render("dashboard", {cssPath: "dashboard.css", players: players});
});

// redirect to home page
app.get("*", function(req, res){
    res.redirect("/");
});

app.listen(3000, "localhost");


var express = require("express");
var app = express();
// middleware
app.use(express.static("public"));
// render will not need to add ejs anymore
app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("landpage", {cssPath: "landpage.css"});
});

app.get("/dashboard", function(req, res){
    res.render("dashboard", {cssPath: "dashboard.css"});
});

// redirect to home page
app.get("*", function(req, res){
    res.redirect("/");
});

app.listen(3000, "localhost");


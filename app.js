var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    Player = require("./models/player");
    Admin = require("./models/admin");
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

var app = express();


// connect database
mongoose.connect("mongodb://localhost:27017/dreamheartDB",  { useNewUrlParser: true });

// Set up admin account
Admin.register(new Admin({username: "admin"}), "admin", function(err, user){
    if(err){
        console.log("[*] Admin Already Register");
    }else{
        console.log("[-] Admin Created")
    }
});

var players = [];

players.push(new Player(
    {name: "林子雋", profession: 432, social: 438, money: 12, love: 2839}), 
    new Player({name: "黃仁愉", profession: 274, social: 233, money: 342, love: 293423}));

// players.forEach(function(p){
//     p.save();
// });
// ==========
// Set view engine
app.set("view engine", "ejs");
// ==========
// middleware
app.use(require("express-session")({
    secret: "life",
    resave: false,
    saveUninitialized: false
}));
// 
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(function(req, res, next){
    res.locals.admin = req.user;
    next();
});
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

// ======
// Routes
app.get("/", function(req, res){
    res.render("landpage", {cssPath: "landpage.css"});
});

app.get("/dashboard", function(req, res){
    res.render("dashboard", {cssPath: "dashboard.css", players: players});
});

// Login
app.get("/login", function(req, res){
    res.render("login", {cssPath: "dashboard.css"});
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
}));

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// Admin page
app.get("/admin", checkLoggedIn, function(req, res){
    res.render("admin", {cssPath: "dashboard.css", players});
});

function checkLoggedIn(req, res, next){    
    // Set request to bring login
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

// redirect to home page
app.get("*", function(req, res){
    res.redirect("/");
});

app.listen(3000, "localhost", function(){
    console.log("[*] Server Started...")
});


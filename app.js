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
        if(err.name == "UserExistsError"){
            console.log("[*] Admin Already Register");
        }else{
            console.log(err);
        }
    }else{
        console.log("[-] Admin Created");
    }
});



// players.push(new Player(
//     {name: "林子雋", profession: 432, social: 438, money: 12, love: 2839}), 
//     new Player({name: "黃仁愉", profession: 274, social: 233, money: 342, love: 293423}));

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
    Player.find(function(err, players){
        if(err) console.log(err);
        res.render("dashboard", {cssPath: "dashboard.css", players: players});
    });
});

// Login
app.get("/login", function(req, res){
    res.render("login", {cssPath: "dashboard.css"});
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/playerList",
    failureRedirect: "/login",
}));

app.get("/logout", checkLoggedIn, function(req, res){
    req.logout();
    res.redirect("/");
});
// Player List Page
app.get("/playerList", function(req, res){
    // Retreive all players
    Player.find(function(err, players){
        if(err){
            console.log(err);
        }else{
            players.sort(function(lplayer, rplayer){
                if(lplayer._id < rplayer._id){
                    return -1;
                }else if(lplayer > rplayer._id){
                    return 1;
                }else{
                    return 0;
                }
            });
            res.render("playerList", {cssPath: "dashboard.css", players: players})        
        }
    });
});
// Player Page
app.get("/player/:pid", function(req, res){
    // Retreive that user 
    var pid = req.params.pid;
    Player.findById(pid, function(err, player){
        if(err){
            console.log(err);
            // if somethings wrong(like someone type wrong pid to url)
            res.redirect("/playerList");
        }else{
            if(player){
                res.render("playerProfile", {cssPath: "dashboard.css", player: player});
            }else{
                res.redirect("/playerList");
            }
        }
    });
})

// Player update
app.post("/player/:pid/update", checkLoggedIn, function(req, res){
    var pid = req.params.pid;
    console.log(pid);
    // TODO: input validation
    var update = { $inc:
                    {
                        profession: req.body.profession,
                        social: req.body.social,
                        money: req.body.money,
                        love: req.body.love
                    },
                  $push:
                    {
                        records: 
                        { 
                            date: new Date(), 
                            profession: req.body.profession,
                            social: req.body.social,
                            money: req.body.money,
                            love: req.body.love
                        }
                    }
                }
        options = {
            new: true
        },
        callback = function(err, player){
            if(err) console.log(err); // update failed
            console.log("[*] Update Player Result");
            res.redirect("/player/"+player._id); // after database update, redirect
        };
    // Incremental update
    Player.findByIdAndUpdate(pid, update, options, callback);
});
// Delete record
app.post("/player/:pid/delete/:rid", checkLoggedIn, function(req, res){
    var pid = req.params.pid, rid = req.params.rid;
    console.log(pid)
    console.log(rid)
    // subtract and remove
    Player.findById(pid, function(err, player){
        // https://mongoosejs.com/docs/subdocs.html#finding-a-subdocument
        var record = player.records.id(rid);
        // Subtract record value
        player.profession -= record.profession;
        player.social -= record.social;
        player.money -= record.money;
        player.love -= record.love;
        record.remove()
        player.save(function(err){
            if(err){
                console.trace();
                console.log(err);
            }
        });
        res.redirect("/player/" + player._id);
    });
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


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
mongoose.connect("mongodb://localhost:27017/tellmegoodgood",  { useNewUrlParser: true });

// Set up admin account: `admin` and password: `admin`
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

function playerCompareFunction(type){
    // sort with ascending order
    return function(left, right){
        if(left[type] < right[type]) return 1; // left should be placed after right
        if(left[type] > right[type]) return -1; // left should be placed before right
        // if there is still a tie, use random key
        if(left.rand < right.rand) return 1;
        if(left.rand > right.rand) return -1; 
        // tie
        return 0;
    };
};

app.get("/debug", checkLoggedIn, function(req, res){
    Player.find().lean().exec(function(err, players){
        // from least significant to most significant
        players.sort(playerCompareFunction("talent"));
        players.sort(playerCompareFunction("sport"));
        players.sort(playerCompareFunction("knowledge"));
        players.sort(playerCompareFunction("game"));
        players.sort(playerCompareFunction("comparison"));
        players.sort(playerCompareFunction("response"));
        res.render("backdoor", {cssPath: "dashboard.css", players: players});
    });
});


app.get("/dashboard", function(req, res){
    // "lean" is for avoiding other information from the database
    Player.find().lean().exec(function(err, players){
        if(err) console.log(err);
        // sort total
        var types = ["talent", "sport", "knowledge", "game", "comparison", "response"];
        var sortedPlayers = {};
        types.forEach(function(type){
            // shallow copy(because we want sort primitive types)
            sortedPlayers[type] = [];
            players.forEach(function(player){
                var cloned = Object.assign({}, player);
                cloned.records = undefined; // do not need to consider records field
                sortedPlayers[type].push(cloned); 
            });
            // sort player with respect to "type"
            sortedPlayers[type].sort(playerCompareFunction(type));    
        });
        res.render("dashboard", {cssPath: "dashboard.css", sortedPlayers: sortedPlayers, players: players});
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
            res.redirect("/");
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
            // if somethings wrong (like someone type wrong pid to url)
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

    req.body.talent = Number(req.body.talent);
    req.body.sport = Number(req.body.sport);
    req.body.knowledge = Number(req.body.knowledge);
    req.body.game = Number(req.body.game);
    req.body.comparison = Number(req.body.comparison);
    req.body.response = Number(req.body.response);
    
    // input validation(double check): If the player's updated scores are not valid, redirect to player profile page
    if(Number.isNaN(req.body.talent) || Number.isNaN(req.body.sport) || 
        Number.isNaN(req.body.knowledge) || Number.isNaN(req.body.game) || 
        Number.isNaN(req.body.comparison) || Number.isNaN(req.body.response)){
        res.redirect("/player/" + pid);
        return;
    }

    var update = { $inc: {
                        talent: req.body.talent,
                        sport: req.body.sport,
                        knowledge: req.body.knowledge,
                        game: req.body.game,
                        comparison: req.body.comparison,
                        response: req.body.response
                    },
                  $push: {
                        records: { 
                            date: new Date(), 
                            talent: req.body.talent,
                            sport: req.body.sport,
                            knowledge: req.body.knowledge,
                            game: req.body.game,
                            comparison: req.body.comparison,
                            response: req.body.response
                        }
                    }
                }
        options = {
            new: true
        },
        callback = function(err, player){
            // if the player is not found, redirect it to the player list page 
            if(err){
                console.log(err); // update failed
                res.redirect("/playerList");
            }else{
                console.log("[*] Update Player Result");
                res.redirect("/player/" + player._id); // after database update, redirect
            }
        };
    // Incremental update
    Player.findByIdAndUpdate(pid, update, options, callback);
});
// Delete record (rid == record id)
app.post("/player/:pid/delete/:rid", checkLoggedIn, function(req, res){
    var pid = req.params.pid, rid = req.params.rid;
    console.log(pid)
    console.log(rid)
    // subtract and remove
    Player.findById(pid, function(err, player){
        if(err){
            console.log(err);
            // e.g. if the record is deleted twice
            res.redirect("/player/" + pid); // if the pid is still not found, /player/:pid will be redirect by other routes
            return;
        }
        // https://mongoosejs.com/docs/subdocs.html#finding-a-subdocument
        // Find the record
        var record = player.records.id(rid);
        console.log(record);
        // if null record, then redirect
        if(!record){
            console.log(record);
            res.redirect("/player/" + player._id);
            return;
        }
        // Subtract the record value
        player.talent -= record.talent;
        player.sport -= record.sport;
        player.knowledge -= record.knowledge;
        player.game -= record.game;
        player.comparison -= record.comparison;
        player.response -= record.response;
        // remove record from database
        record.remove() //reference: https://mongoosejs.com/docs/subdocs.html
        player.save(function(err2){
            if(err2){
                console.trace();
                console.log(err2);
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


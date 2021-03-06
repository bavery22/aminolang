var fs = require('fs');
var amino = require('/data/node/amino.js');
console.log("Greetings Earthling!");
var core = amino.getCore();
var stage = core.createStage();

//load up the scene file
var filedata = fs.readFileSync('scene.json');
var jsonfile = JSON.parse(filedata);
console.log(jsonfile);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);





//grab all the apps and init them
var apps = [
    stage.findNodeById("app1"),
    stage.findNodeById("app2"),
    stage.findNodeById("app3")
];

for(var i in apps) {
    apps[i].setTx(0);
    apps[i].setTy(71);
    apps[i].setVisible(false);
}
var currentApp = 0;
apps[currentApp].setVisible(true);




// navigation buttons
function navNextApp() {
    apps[currentApp].setVisible(false);
    currentApp++;
    if(currentApp > apps.length-1) {
        currentApp = apps.length-1;
    }
    apps[currentApp].setVisible(true);
}

function navPrevApp() {
    apps[currentApp].setVisible(false);
    currentApp--;
    if(currentApp < 0) {
        currentApp = 0;
    }
    apps[currentApp].setVisible(true);
}
stage.on("PRESS",stage.findNodeById("prevButton"), function() {
    navPrevApp();
});
stage.on("PRESS",stage.findNodeById("nextButton"), function() {
    navNextApp();
});




// the exit button
stage.on("PRESS",stage.findNodeById("exitButton"), function() {
    process.exit(0);
});



//animation support
function camelize(s) {
    return s.substring(0,1).toUpperCase() + s.substring(1);
}
function a(node, prop, start, finish, dur) {
    return {
        node:node,
        prop:prop,
        sval:start,
        fval:finish,
        dur:dur,
        running:false,
        finished:false,
        easefn:null,
        setVal:function(t) {
            if(this.easefn != null) {
                t = this.easefn(t);
            }
            var v = (this.fval-this.sval)*t + this.sval;
            //console.log("t = " + t + " " + v);
            node["set"+camelize(this.prop)](v);
        },
        update:function() {
            if(this.finished) return;
            if(!this.running) {
                this.startTime = new Date().getTime();
                this.running = true;
                return;
            }
            var time = new Date().getTime();
            var dt = time-this.startTime;
            var t = dt/this.dur;
            if(t > 1) {
                this.finished = true;
                this.setVal(1);
                return;
            }
            this.setVal(t);
        },
        setEase:function(easefn) {
            this.easefn = easefn;
            return this;
        }
    };
}




// setup for the match game
var centerTarget = stage.findNodeById("centerTarget");

var colors = ["#ff0000", "#ffff00", "#ff00ff","#00ff00", "#00ffff", "#0000ff"];

var rects = [
    stage.findNodeById("r1"),
    stage.findNodeById("r2"),
    stage.findNodeById("r3"),
    stage.findNodeById("r4"),
    stage.findNodeById("r5"),
    stage.findNodeById("r6"),
];

centerTarget.setFill(colors[0]);
var currentColor = 0;
stage.findNodeById("winGroup").setVisible(false);
function nextColor() {
    currentColor++;
    if(currentColor > colors.length-1) {
        console.log("you've won!");
        stage.findNodeById("winGroup").setVisible(true);
    } else {
        centerTarget.setFill(colors[currentColor]);
    }
}
stage.on("PRESS",stage.findNodeById("winBG"), function() {
    for(var i in rects) {
        rects[i].setTx(rects[i].start_tx);
        rects[i].setTy(rects[i].start_ty);
        rects[i].setVisible(true);
    }
    currentColor = 0;
    centerTarget.setFill(colors[currentColor]);
    stage.findNodeById("winGroup").setVisible(false);
});

function movePieceBack(r) {
    stage.addAnim(a(r,"tx",r.getTx(),r.start_tx,250));
    stage.addAnim(a(r,"ty",r.getTy(),r.start_ty,250));
}


//make each rect draggable
//check for win condition on drag release
for(var i in rects) {    
    rects[i].setFill(colors[i]);
    rects[i].start_tx = rects[i].getTx();
    rects[i].start_ty = rects[i].getTy();
    stage.on("DRAG",rects[i],function(e) {
        var t = e.target;
        t.setTx(t.getTx()+e.delta.y);
        t.setTy(t.getTy()-e.delta.x);
    });
    stage.on("RELEASE",rects[i],function(e) {
        if(e.target.getFill() == centerTarget.getFill()) {
            e.target.setVisible(false);
            nextColor();
        } else {
            movePieceBack(e.target);
        }
    });
}


//music player

var currentSong;
stage.on("PRESS", stage.findNodeById("playSongButton"), function(e) {
    console.log("playing a song: " + currentSong);
    if(currentSong) {
        console.log("already have a song");
        if(currentSong.isPlaying()) {
            console.log("doing pause");
            currentSong.pause();
        } else {
            console.log("doing play");
            currentSong.play();
        }
    } else {
        currentSong = stage.loadSong("/data/node/01_789.mp3");
        console.log("got a song object. about to play it\n");
        currentSong.play();
    }
});

var snacktimeImage;

var setupTextures = function() {
    stage.loadTexture("/data/node/snacktime.png",240,240, function (id) {
        var rect = stage.findNodeById("albumArt");
        snacktimeImage = id;
        rect.draw = function(gfx) {
            gfx.fillQuadTexture(id,0,0,500,500);
        }
    });
}


//music keyboard

function setupKeyboard() {
//var singleSong = stage.loadSong("/data/node/loud-c3.mp3");
    var songFiles = ["loud-c3.mp3","loud-d3.mp3","loud-e3.mp3","loud-f3.mp3", "loud-g3.mp3"];
    var flatFiles = ["loud-db3.mp3","loud-eb3.mp3","loud-gb3.mp3"];

    function attachMusic(key, file) {
        var song = stage.loadSong("/data/node/"+file);
        stage.on("PRESS", key, function(e) {
            console.log("playing = " + song.isPlaying());
            if(song.isPlaying()) {
                song.stop();
                song.play();
            } else {
                song.play();
            }
        });
    }
    
    var keyboard = stage.findNodeById("app3");
    for(var i=0; i<5; i++) {
        var key = core.createRect();
        key.setW(200).setH(400).setTx(40+i*250).setTy(280).setFill("#ffffff");
        keyboard.add(key);
        attachMusic(key,songFiles[i]);
        stage.on("PRESS", key, function(e) {
            e.target.setFill("#cccccc");
        });
        stage.on("RELEASE", key, function(e) {
            e.target.setFill("#ffffff");
        });
    }
    for(var i=0; i<3; i++) {
        var key = core.createRect();
        key.setW(200).setH(350).setTx(170+i*250).setTy(50).setFill("#000000");
        if(i==2) {
            key.setTx(key.getTx()+250);
        }
        keyboard.add(key);
        attachMusic(key,flatFiles[i]);
        stage.on("RELEASE", key, function(e) {
            e.target.setFill("#000000");
        });
        stage.on("PRESS", key, function(e) {
            e.target.setFill("#444444");
        });
    }    
}


//delay 1 sec to ensure the png image is loaded first
setTimeout(function() {
    console.log("starting later\n");
    core.start();
    setupTextures();
    setupKeyboard();
},2000);

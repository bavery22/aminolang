var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

function NavigationManager(stage,core) {
    this.panels = [];
    
    //install a group to hold popups
    this.holder = new amino.ProtoGroup();
    var scrim = new amino.ProtoRect()
        .setW(stage.getW())
        .setH(stage.getH())
        .setFill("#00ff00");
    scrim.draw = function() {}
    scrim.setVisible(false);
    var self = this;
    stage.on("PRESS",scrim,function() {
        for(var k in self.transitions) {
            var trans = self.transitions[k];
            if(trans.type == "popup") {
                if(trans.dst.getVisible()) {
                    trans.dst.setVisible(false);
                }
            }
        }
        scrim.setVisible(false);
    });
    this.holder.add(scrim);
    stage.getRoot().add(this.holder);
    
    this.register = function(panel) {
        this.panels.push(panel);
    }
    this.transitions = {};
    this.createTransition = function(name,src,dst,type) {
        this.transitions[name] = {
            name:name,
            src:src,
            dst:dst,
            type:type
        };
        if(type == "popup") {
            dst.setVisible(false);
            dst.getParent().remove(dst);
            this.holder.add(dst);
        }
    }
    this.navstack = [];
    
    this.push = function(name) {
        var trans = this.transitions[name];
        try {
        if(trans.type == "popup") {
            scrim.setVisible(true);
            trans.dst.setVisible(true);
            var x2 = trans.src.getTx() + trans.src.getW() + 10;
            var pw = trans.dst.getW();
            trans.dst.setTy(10);
            if(x2 > stage.getW() - pw) {
                x2 = trans.src.getTx() - pw - 10;
            }
            core.createPropAnim(trans.dst,"tx",0,x2, 300, 1, false);
        } else {
            stage.addAnim(amino.anim(trans.src, "tx", 0, -stage.width, 250));
            stage.addAnim(amino.anim(trans.dst, "tx", stage.width,  0, 250)
                .before(function(){ trans.dst.setVisible(true);})
                );
        }
        } catch (e) {
            console.log(e);
        }
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        if(trans.type == "popup") {
            core.createPropAnim(trans.dst,"tx",trans.dst.getTx(),0, 300, 1, false)
                .after(function() { trans.dst.setVisible(false); })
            ;
        } else {
            stage.addAnim(amino.anim(trans.src, "tx", -400, 0, 250));
            stage.addAnim(amino.anim(trans.dst, "tx", 0,  400, 250)
                .after(function() { trans.dst.setVisible(false); })
                );
        }
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(e.width).setH(e.height-30);
            if(panel.getParent() && panel.getParent().type == "Transform") {
                panel.setTy(0);
            } else {
                panel.setTy(30);
            }
        }
        scrim.setW(e.width).setH(e.height);
    });
}


exports.NavigationManager = NavigationManager;

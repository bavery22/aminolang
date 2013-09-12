var  widgets= require(process.env.AMINOPATH+'/widgets.js'); 
var amino = require(process.env.AMINOPATH+'/amino.js'); //change to wherever you end up putting amino
var fs = require('fs');
var sys = require('sys');

//stage will be created for us already
amino.startApp(function(core,stage) {
    //always use a group for your scene root
    var groupRoot = new amino.ProtoGroup();
    var group1 = new amino.ProtoGroup();
    var group2 = new amino.ProtoGroup();
    var group3 = new amino.ProtoGroup();
    stage.setRoot(groupRoot);

    var tField = new amino.ProtoText();
    tField.setText("This is a text field");
    tField.setTy(500);
    tField.setFontSize(60);
    group3.add(tField);
    groupRoot.add(group3);


    //button
    var button1 = new widgets.PushButton();
    button1.setText("Group1!");
    button1.setFontSize(40);
    button1.setTx(0);
    button1.setTy(0);
    button1.setW(200);
    button1.setH(80);
    group1.add(button1);

    var rect = new amino.ProtoRect();
    rect.setW(200);
    rect.setH(80);
    rect.setTx(0);
    rect.setTy(300);
    rect.setFill("#DD0000");
    group1.add(rect);

    groupRoot.add(group1);

    
    //button2
    var button2 = new widgets.PushButton();
    button2.setText("Group2!");
    button2.setFontSize(40);
    button2.setTx(500);
    button2.setTy(0);
    button2.setW(200);
    button2.setH(80);
    group2.add(button2);

    var rect2 = new amino.ProtoRect();
    rect2.setW(80);
    rect2.setH(160);
    rect2.setTx(0);
    rect2.setTy(300);
    rect2.setFill("#0000DD");
    group2.add(rect2);

    
    groupRoot.add(group2);


    core.on("action",button1, function() {
        console.log("you activated the button1");
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600, 1, false);
	var anim = core.createPropAnim(rect,"tx",0, 400, 600, 1, true);
	var anim2 = core.createPropAnim(rect,"ty",300, 900, 600, 1, true);
        //optional
        anim.setInterpolator(amino.Interpolators.CubicInOut);
        anim2.setInterpolator(amino.Interpolators.CubicInOut);
	setTimeout(function(){
	    console.log ("starting button1 cb visibiity state: g1 = "+group1.getVisible()+" group2 = "+group2.getVisible());
	    console.log("button1 cb group1 invisible group 2 visible ");
	    group1.setVisible(0);
	    group2.setVisible(1);
	    console.log ("visibiity state: g1 = "+group1.getVisible()+" group2 = "+group2.getVisible());

	},1000);
    });

    core.on("action",button2, function() {
        console.log("you activated the button2");
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600, 1, false);
	var anim = core.createPropAnim(rect2,"tx",0, 400, 800, 1, true);
	var anim2 = core.createPropAnim(rect2,"ty",300, 900, 800, 1, true);
        //optional
        anim.setInterpolator(amino.Interpolators.CubicInOut);
	setTimeout(function(){
	    console.log ("starting button2 cb visibiity state: g1 = "+group1.getVisible()+" group2 = "+group2.getVisible());
	    console.log("button2 cb group1 visible group 2 invisible ");
	    group1.setVisible(1);
	    group2.setVisible(0);
	    console.log ("visibiity state: g1 = "+group1.getVisible()+" group2 = "+group2.getVisible());
	},1000);
    });


});

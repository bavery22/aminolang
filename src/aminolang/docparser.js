var u = require('util');

var classes = {};
var clazz = {};
function startNewClass(id) {
    clazz = { id: id, props:[], funcs:[]};
    classes[id] = clazz;
}
function addDesc(text) {
    clazz.desc = text;
}
function addProp(name,desc) {
    clazz.props.push({name:name, desc: desc});
}
function addFunc(name, desc) {
    clazz.funcs.push({name:name, desc: desc});
}
function dump() {
    var c = classes;
    classes = {};
    clazz = {};
    return c;
}
ometa DocParser <: Parser {
    sp = (' '|'\n'|'\t')*,
    any = (~"*/" char),
    sany = (~"/**" char),
    
    id = (letter+):x -> x.join(""),
    classdef = "@class" sp id:id               -> startNewClass(id),
    
    text     = any*:x               -> x.join(""),
    desc     = "@desc" text:text               -> addDesc(text),
    prop     = "@prop" sp id:id sp text:text   -> addProp(id,text),
    prop     = "@func" sp id:id sp text:text   -> addFunc(id,text),
    
    doc      = classdef | desc | prop,
    comment  = "/**" sp doc*:doc sp "*/"       -> [#comment, doc],
    block    = comment:c1 (~"/**" char)*:junk  -> c1,
    top      = block* -> dump(),
    
    //dummy rule
    foo = bar
}




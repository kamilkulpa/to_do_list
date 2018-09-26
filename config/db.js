var express = require('express');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tododb');

var usersSchema = mongoose.Schema({
    Username: String,
    Password: String,
    ver_code: String,
    verified: Boolean
});
var user =mongoose.model('Users',usersSchema);

var listsSchema = mongoose.Schema({
    UserID: mongoose.Schema.Types.ObjectId,
    ListURL: String
});
var list = mongoose.model('List', listsSchema);

var list_itemsSchema = mongoose.Schema({
    ListID: mongoose.Schema.Types.ObjectId,
    ListText: String,
    ListItemDone: Number,
    ListItemPosition: Number
});
var listItem = mongoose.model('ListItem',list_itemsSchema);


exports.mongoose;
exports.usersSchema;
exports.user;
exports.listsSchema;
exports.list;
exports.list_itemsSchema;
exports.listItem;
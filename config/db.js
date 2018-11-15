var express = require('express');
var session = require('express-session')
exports.MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tododb', {
    useNewUrlParser: true
});

var usersSchema = mongoose.Schema({
    Username: String,
    Password: String,
    email: String,
    ver_code: String,
    paswordResetExpires: Date,
    isVerified: {
        type: Boolean,
        default: false
    }

});
var User = mongoose.model('Users', usersSchema);

var tokenSchema = mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    craetedAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }
});
var Token = mongoose.model('Tokens', tokenSchema)

var listsSchema = mongoose.Schema({
    UserID: mongoose.Schema.Types.ObjectId,
    ListName: String,
    ListURL: String
});
var List = mongoose.model('List', listsSchema);

var list_itemsSchema = mongoose.Schema({
    ListID: mongoose.Schema.Types.ObjectId,
    ListText: String,
    ListItemDone: Number,
    ListItemPosition: Number
});
var ListItem = mongoose.model('ListItem', list_itemsSchema);


exports.mongoose;
exports.usersSchema;
exports.User = User;
exports.listsSchema;
exports.List = List;
exports.list_itemsSchema;
exports.ListItem = ListItem;
exports.Token = Token
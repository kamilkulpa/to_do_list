var express = require('express')
var db = require('../config/db')
var crypto = require('crypto')
var item = require('../models/list_items')
var app = express();

exports.createList = function (req, res) {

    var url = crypto.randomBytes(10).toString('hex');
    console.log(url)
    var sameURL = true;
    while (sameURL === true) {
        console.log(sameURL)
        url = crypto.randomBytes(10).toString('hex');
        console.log("eloooo")
        db.List.findOne({
            ListURL: url
        }, (err, response) => {
            if (!response) {
                sameURL = false;
                res.render('show_message', {
                    message: "Databese error",
                    type: "error"
                });
            } else console.log('jojojo')
            if (err) {
                console.log('heheheheh')
                console.log(url)
            } else console.log('hujjjjj')
        })
    }
    var list = new db.List({
        UserID: req.sesion.user._id,
        ListName: req.body.name,
        ListURL: url
    })
    list.save((err) => {
        if (err)
            res.render('show_message', {
                message: "Databese error",
                type: "error"
            });
        else
            res.redirect('/user/list/' + url)
    })
}

exports.createList1 = function (req, res) {
    var url = crypto.randomBytes(10).toString('hex');
    console.log(url)
    var sameURL = true;
    db.List.findOne({
        ListURL: url
    }, (err, response) => {
        if (err) res.render('show_message', {
            message: "Databese error",
            type: "error"
        });
        if (response) createList1(req, res)
        else {

            var list = new db.List({
                UserID: req.session.user._id,
                ListName: req.body.name,
                ListURL: url
            })
            list.save((err) => {
                if (err)
                    res.render('show_message', {
                        message: "Databese error",
                        type: "error"
                    });
                else
                    res.redirect('/user/myprofile')
            })
        }
    })
}

exports.renderListUser = async function (req, res) {
    var list;
    var items1 = [];
    var id
    var name
    await db.List.findOne({
        ListURL: req.params.id
    }, async (err, response) => {
        if (err) res.render('show_message', {
            message: "Databese error",
            type: "error"
        });
        if (response) {
            list = response;
            id = list._id;
            name = list.ListName;
            return name
        }
    })
    new Promise(function (resolve, reject) {
            db.ListItem.find({
                    ListID: id
                }).cursor()
                .on('data', function (doc) {
                    items1[doc.ListItemPosition] = doc.ListText
                })
                .on('error', reject)
                .on('end', resolve);
        })

        .then(() => {
            req.session.list = req.params.id
            res.render('list', {
                title: name,
                items: items1,
                url: req.params.id
            })
        })
}

exports.renderList = async function (req, res) {
    var list;
    var items1 = [];
    var id
    var name
    await db.List.findOne({
        ListURL: req.params.id
    }, async (err, response) => {
        if (err) res.render('show_message', {
            message: "Databese error",
            type: "error"
        });
        if (response) {
            list = response;
            id = list._id;
            name = list.ListName;
            return name
        }
        if(!name){
            res.render('show_message', {
                message: "Wrong adress. List don't exist",
                type: "error"
            });
            return name;
        }
    })
    new Promise(function (resolve, reject) {
            db.ListItem.find({
                    ListID: id
                }).cursor()
                .on('data', function (doc) {
                    items1[doc.ListItemPosition] = doc.ListText
                })
                .on('error', reject)
                .on('end', resolve);
        })

        .then(() => {
            res.render('list1', {
                title: name,
                items: items1,
                url: req.params.id
            })
        })
}



exports.deleteList = async function (id, req, res) {
    try {
        db.List.findOneAndRemove({
            ListURL: id
        }, async (err, response) => {
            if (err) console.log("Problem with deleting list")
            else {
                console.log("Problem with " + response)
                await item.deleteAllItems(response._id);
            }
        });
        res.redirect('/user/myprofile')
        return 1
    } catch (e) {
        console.log("LOLOLOLOLOL3 " + e)
        return 0
    }
}
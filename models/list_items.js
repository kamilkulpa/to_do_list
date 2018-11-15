var express = require('express')
var db = require('../config/db')
var crypto = require('crypto')
var app = express();

exports.createItem = async function (req, res) {
    var list;
    var itemsOnList;
    try {
        list = await db.List.findOne({
            UserID: req.session.user._id,
            ListURL: req.session.list
        }).exec();
        itemsOnList = await db.ListItem.count({
            ListID: list._id
        }).exec();
        var item = await new db.ListItem({
            ListID: list.id,
            ListText: req.body.text,
            ListItemDone: 0,
            ListItemPosition: itemsOnList
        })

        await item.save((err) => {
            if (err)
                res.render('show_message', {
                    message: "Databese error",
                    type: "error"
                });
            else
                db.ListItem.find({
                    ListID: list._id
                }, async (err, response) => {
                    if (response) list = response;
                })
            res.redirect('/user/Lists/' + req.session.list)
        })
    } catch (e) {
        console.log("We  cant find items on list" + e)
        res.redirect('/user/Lists/' + req.session.list)
        return 1
    }
}

exports.posUp = async function (req, res) {
    var temp, temp2, list;
    try {
        list = await db.List.findOne({
            ListURL: req.params.id
        }).exec();
        if (list != null) {
            temp2 = parseInt(req.params.id2);
            temp = await db.ListItem.findOne({
                ListItemPosition: (temp2 - 1),
                ListID: list._id
            }).exec();
            console.log(temp)
            await db.ListItem.findOneAndUpdate({
                ListItemPosition: temp2,
                ListID: list._id
            }, {
                ListItemPosition: temp.ListItemPosition
            }).exec();
            await db.ListItem.findOneAndUpdate({
                _id: temp.id,
                ListID: list._id
            }, {
                ListItemPosition: temp.ListItemPosition + 1
            }).exec();
            res.redirect('/user/Lists/' + req.params.id);
        }
        return 1
    } catch (e) {
        console.log(e)
        res.redirect('/user/Lists/' + req.params.id)
        return 0
    }
}




exports.posDown = async function (req, res) {
    var temp, temp2, list;
    try {
        list = await db.List.findOne({
            ListURL: req.params.id
        }).exec();
        if (list != null) {
            temp2 = parseInt(req.params.id2);
            temp = await db.ListItem.findOne({
                ListItemPosition: (temp2 + 1),
                ListID: list._id
            }).exec();
            await db.ListItem.findOneAndUpdate({
                ListItemPosition: temp2,
                ListID: list._id
            }, {
                ListItemPosition: temp.ListItemPosition
            }).exec();
            await db.ListItem.findOneAndUpdate({
                _id: temp.id,
                ListID: list._id
            }, {
                ListItemPosition: temp.ListItemPosition - 1
            }).exec();
            console.log("Zrobione");
            res.redirect('/user/Lists/' + req.session.list);
        }
        return 1
    } catch (e) {
        console.log(e)
        res.redirect('/user/Lists/' + req.session.list)
        return 0
    }
}

exports.deleteItem = async function (req, res) {
    var temp, itemsOnList, list;
    try {
        list = await db.List.findOne({
            ListURL: req.params.id
        }).exec();
        if (list != null) {
            temp = parseInt(req.params.id2);
            itemsOnList = await db.ListItem.count().exec();
            await db.ListItem.findOneAndRemove({
                ListItemPosition: temp,
                ListID: list._id
            }).exec();
            for (var i = temp + 1; i < itemsOnList; i++) {
                await db.ListItem.findOneAndUpdate({
                    ListItemPosition: i,
                    ListID: list._id
                }, {
                    ListItemPosition: i - 1
                }).exec();
            }
            await
            console.log(req.params.id2)
            res.redirect('/user/Lists/' + req.session.list)
        }
    } catch (e) {
        console.log(e)
        res.redirect('/user/Lists/' + req.session.list)
        return 0
    }
}

exports.deleteAllItems = async function (param) {
    var itemsOnList
    try {
        itemsOnList = await db.ListItem.count({
            ListID: param
        }).exec();
        for (var i = 0; i < itemsOnList; i++) {
            await db.ListItem.findOneAndDelete({
                ListID: param
            })
        }
        return 1;
    } catch (e) {
        console.log(e)
        return 0
    }
}
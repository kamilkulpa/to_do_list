var express = require('express')
var db = require('../config/db')
var list = require('../models/lists')
var session = require('express-session')
var cookieParser = require('cookie-parser');
var crypto = require('crypto')
var nodemailer = require('nodemailer')
var app = express();

app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

hash = function(password) {
    return crypto.createHash('sha1').update(password).digest('base64')
}

exports.create = function(req, name, pasword, pasword1, emaill, res){
    if(pasword === pasword1) {
        var user = new db.User ({
        Username: name,
        Password: hash(pasword),
        email: emaill,
        ver_code: null,
        verified: false
    })}else{
        res.render('show_message', {message: "Passwords are  not the same", type: "error"});
    }
    ( db.User.findOne({Username: name},(err, response) =>{
        console.log(response);
        if(response)
        res.render('show_message', {message: "Username already exist", type: "error"});
      else {
    user.save((err) =>{
        if(err)
        res.render('show_message', {message: "Databese error", type: "error"});
        else
        res.render('show_message', {
            message: "New person added. Verification email was sended", type :"succes"});
        })
        var token = new db.Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
        token.save((err) => {
            if(err)res.render('show_message',{message: "Database problem", type: "error"});

            var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'account@gmail.com', pass: 'password' } });
            var mailOptions = { from: 'account@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions,(err) => {
                if (err){res.render('show_message',{message: "Database problem", type: "error"})}
                console.log("Mail send")
            })
        })
    }
})
    )}

exports.checkSignIn = function(req, res, next){
    if(req.session.user){
       next(); 
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        res.redirect('/user/login') 
     }
  }


exports.updatePassword = function(req, oldPasdword, newPassword, newPassword1, res){
    if(newPassword === newPassword1){
        if(oldPasdword != newPassword){
        db.User.findOneAndUpdate({Username: req.session.user.Username, Password: hash(oldPasdword)},  {Password: hash(newPassword)}, (err, response) => {
            if(err) {
                res.render('changepassword', {message: "Somethig go wrong. Try one more time."});
          } else res.redirect('/user/myprofile');
        });
    }else   res.render('changepassword', {message: "New password can't be the same as old"});   
    } else res.render('changepassword', {message: "Passwords aren't the same"});
}

exports.updateEmail = function(req, res){
    if(req.oldEmail != req.newEmail ){
        db.User.findOneAndUpdate({Username: req.session.user.Username },  {email: req.newEmail}, (err, response) => {
            if(err) {
                res.render('changeemail', {message: "Somethig go wrong. Try one more time."});
          } else res.redirect('/user/myprofile');
        });     
    } else {
        res.render('changeemail', {message: "New email adress cat be teh same as old"}); 
    }
}

exports.deleteUser = function(req, res){
    db.User.findByIdAndRemove(req.session.user._id);
    res.redirect('/user/new')
}

exports.login = function(req, res) {
    db.User.findOne((err, response) => {
        console.log(response)})
    if(!req.body.username || !req.body.password){
        res.render('login', {message: "Please enter both name and password"});
     } else {
       db.User.findOne({Username: req.body.username}, (err, response) => {
        if(!response){
            res.render('show_message', {message: "User dont exist", type: "error"});
        }else {
                    if(response.Password === hash(req.body.password)){
                        if(response.isVerified){
               req.session.user = response;

               res.redirect('/user/myprofile');
                        } else  res.render('login', {message: "Please verify your account"});
                    } else   res.render('login', {message: "Invalid credentials!"});
                
            } 
            });
        }
        } 
      
exports.confirmationPost = function(req,res,next){
    db.Token.findOne({token: req.params.id}, (err, token) => {
        if(!token) return res.status(400).send({type:'not_verified', msg:"We ar unabele to find a token"});

        db.User.findOne({_id: token._userId}, (err, user) =>{
            if(!user) return  res.status(400).send({type:'not_verified', msg:"We ar unabele to find a user for this token"});
            if(user.isVerified) return res.status(400).send({type:'already-verified', msg:"This user is verified"});

            user.isVerified = true;
            user.save((err) => {
                if(err) { return res.status(500).send({ msg: err.message});}
                res.render('login', {message:"The account has been verified log in"});
            });
        });
    }) ;
};

exports.resendTokenPost = function(req, res, next){
    db.User.findOne({email: req.body.email, Username: req.body.username}, (err, user) => {
        if(!user) return res.status(400).send({ msg: "We are unable to find a user"});
        if(user.isVerified)return res.render('login', {message:"The account has been verified log in"});
        
        var token = new db.Token({_userId: user.id, token: crypto.randomBytes(16).toString('hex')});

        token.save((err) => {
            if(err) {return res.status(500).send({msg: err.message});}

            var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'account@gmail.com', pass: 'password' } });
            var mailOptions = { from: 'account@gmail.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions,(err) => {
                if (err){res.render('show_message',{message: "Database problem", type: "error"})}
                res.render('login', {message: "Verification email was sended"});
        })
    })
})
}

exports.retrievePassword = function(req, res){
    db.User.findOne({Username: req.body.username}, (err, user) => {
        if(!user)return res.status(400).send({msg: "We are unable to find user"});
        var pass = crypto.randomBytes(5).toString('hex');

        db.User.findOneAndUpdate({_id: user._id}, {Password: hash(pass)}, (err, response) => {
            if(err) {return res.status(500).send({msg: err.message});}

            var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'account@gmail.com', pass: 'password' } });
            var mailOptions = { from: 'account@gmail.com', to: user.email, subject: 'New password', text: 'Hello,\n\n' + 'Your new password is: ' + pass + '.\n' };
            transporter.sendMail(mailOptions,(err) => {
                if (err){res.render('show_message',{message: "Database problem", type: "error"})}
                res.redirect('/user/login');
        })
        })
    })
}

exports.logout = function(req, res){
    req.session.destroy();
    res.redirect('/user/login');
}

exports.renderingProfile = function(req, res){
    db.List.find({UserID: req.session.user._id}, (err, response) => {
        //console.log(response);
        if(!response){console.log("niema");
        return res.render('myprofile')}
        else{
            var url =[];
            var name = [];
           for (let i=0;i<response.length;i++){
            url[i]=response[i].ListURL;
            name[i] = response[i].ListName;
           }
         return res.render('myprofile', {urls: url,Listname: name })}
    })
}

exports.deleteUser = async function(req, res){
    var listCount;
    try{
    listCount = await db.List.count({UserID: req.session.user._id});
    console.log("oooooooooo" + listCount)
    for(var i = 0; i < listCount; i++){
       await db.List.findOne({UserID: req.session.user._id}, async (err, response)=>{
           console.log("uuuuuu" + response)
            await list.deleteList(response.ListURL, req, res)
        })
       
    }await db.User.findByIdAndDelete({_id: req.session.user._id})
    res.redirect('/user/login')
    return 1
}
catch (e){
    console.log("LOLOLOLOLOL1 " + e)
    return 0
    }
   }
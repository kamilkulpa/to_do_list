var express = require('express');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var user = require('../models/users')
var list = require('../models/lists')
var item = require('../models/list_items')
const {
    check,
    validationResult
} = require('express-validator/check');
var app = express();

var router = express.Router();

app.use(cookieParser());
app.use(session({
    secret: "Your secret key"
}));

router.get('/new', (req, res) => {
    res.render('new')
})

router.post('/new', (req, res) => {
    console.log("added");
    check(req.body.email).isEmail()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('new', {
            message: "Wrong emial format"
        })
        return res.status(422).json({
            errors: errors.array()
        });
    }
    var newUser = req.body;
    user.create(req, newUser.username, newUser.password, newUser.password1, newUser.email, res);
});

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', (req, res) => {
    user.login(req, res)
});

router.get('/myprofile', user.checkSignIn, (req, res) => {
    user.renderingProfile(req, res)
})
router.get('/changePassword', user.checkSignIn, (req, res) => {
    res.render('changepassword')
})

router.post('/changePassword', user.checkSignIn, (req, res) => {
    var newPass = req.body;
    user.updatePassword(req, req.body.oldPassword, req.body.newPassword1, req.body.newPassword2, res)
});

router.get('/changeEmail', user.checkSignIn, (req, res) => {
    res.render('changeemail')
})

router.post('/changeEmail', user.checkSignIn, (req, res) => {
    user.updateEmail(req, res);
});

router.get('/delete', (req, res) => {
    user.deleteUser(req, res);
})

router.get('/Lists/delete/:id', user.checkSignIn, (req, res) => {
    var id = req.params.id
    list.deleteList(id, req, res)
})

router.get('/Lists/:id', user.checkSignIn, (req, res) => {
    list.renderListUser(req, res);
})

router.post('/List/newItem', user.checkSignIn, (req, res) => {
    item.createItem(req, res)
});

router.get('/confirmation/:id', user.confirmationPost, (req, res) => {
    res.render('login');
})

router.post('/resend', (req, res) => {
    user.resendTokenPost(req, res)
});

router.get('/resend', user.checkSignIn, (req, res, next) => {
    res.render('login');
})

router.get('/resendEmail', (req, res) => {
    res.render('resendemail', {
        message: "Please enter data you provaided when you create account"
    })
})

router.get('/resetPassword', (req, res) => {
    res.render('resetpassword')
})

router.get('/reset', (req, res) => {
    res.redirect('/user/login')
})

router.post('/reset', (req, res) => {
    user.retrievePassword(req, res);
});

router.get('/logout', (req, res) => {
    user.logout(req, res);
})

router.post('/newList', user.checkSignIn, (req, res) => {
    list.createList1(req, res)
})

router.get('/Lists/:id/posUp/:id2', user.checkSignIn, (req, res) => {
    item.posUp(req, res)
})

router.get('/Lists/:id/posDown/:id2', user.checkSignIn, (req, res) => {
    item.posDown(req, res)
})
router.get('/Lists/:id/delete/:id2', user.checkSignIn, (req, res) => {
    item.deleteItem(req, res)
})
module.exports = router;
const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/article');
// Bring in User Model
let User = require('../models/user');

// Add Article
router.get('/add', ensureAuthenticated, function(req,res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit Article
router.post('/add', ensureAuthenticated, function(req,res) {
    req.checkBody('title', 'Title is Required').notEmpty();
    // req.checkBody('author', 'Author is Required').notEmpty();
    req.checkBody('body', 'Body is Required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err){
            if(err) {
                console.log(err);
            } else {
                req.flash('success','Article Added.');
                res.redirect('/');
            }
        });
    }
});

// Edit Single Article
router.get('/edit/:id', ensureAuthenticated, function(req,res,next){
    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            req.flash('danger', 'Not Authorized.');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Update Submit Article
router.post('/edit/:id', function(req,res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.updateOne(query, article, function(err){
        if(err) {
            console.log(err);
        } else {
            req.flash('success','Article Updated.');
            res.redirect('/');
        }
    });
});

// Delete Single Article
router.delete('/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id};

    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function(err) {
                if(err){
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });


});

// Get Single Article
router.get('/:id', function(req,res){
    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Pleae Login');
        res.redirect('/users/login');
    }
}
module.exports = router; 
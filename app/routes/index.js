'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {
    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
    
    var clickHandler = new ClickHandler();
    
    app.route('/')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/index.html');
        });
    app.route('/myPolls')
        .get(isLoggedIn, function(req, res) {
            res.sendFile(path + '/public/myPolls.html');
        });
    app.route('/newPoll')
        .get(isLoggedIn, function(req, res) {
            res.render('newPoll');
        });
    app.route('/login')
        .get(function(req, res) {
            res.sendFile(path + '/public/login.html');
        });
    app.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect('/login');
        });
    app.route('/profile')
        .get(isLoggedIn, function(req, res) {
            res.sendFile(path + '/public/profile.html');
        });
        
    // New stuff
    app.route('/api/charts')
        .get(clickHandler.getCharts);
    app.route('/api/myCharts')
        .get(clickHandler.getMyCharts);
    app.route('/api/chart/:id/owner/isOwner')
        .get(clickHandler.ownerCheck);
    app.route('/api/chart/:id')
        .get(clickHandler.getChart)
        .delete(clickHandler.deleteHandler);
    app.route('/chart/:id')
        .get(clickHandler.idExists, function(req, res) {
            if(req.isAuthenticated()) {
                res.render('chartAuth', {chartId: req.params.id});
            } else {
                res.render('chartUnauth', {chartId: req.params.id});
            }
            
        });
    app.route('/api/newChart')
        .post(clickHandler.newChart);
    app.route('/api/isAuth')
        .get(function(req, res) {
            if(req.isAuthenticated()) {
                res.json({auth : true})
            } else {
               res.json({auth : false});
            }
        });

    app.route('/api/chart/:id/:choice')
        .post(clickHandler.choiceHandler);
       // .get(clickHandler.choiceHandler);
    app.route('/auth/github')
        .get(passport.authenticate('github'));
    
    app.route('/auth/github/callback')
        .get(passport.authenticate('github', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));
    
    

};
'use strict';

var Users = require("../models/users.js");
var Charts = require("../models/charts.js");


function ClickHandler() {
    this.getCharts = function(req, res) {
        var chartProjection = {
            '_id' : true,
            'title': true,
            'data' : true,
            'authorId':true
        };
        Charts
            .find({}, chartProjection)
            .exec(function(err, result) {
                if(err) {
                    res.json([]);
                    //throw err;
                }
                
                res.json(result);
            });
    }
    
    this.getMyCharts = function(req, res) {
        var toSend = {};
        if(req.isAuthenticated()) {
            var chartProjection = {
                '_id' : true,
                'title': true,
                'data' : true,
                'authorId':true
            };
            Charts
                .find({authorId : req.user.github.id}, chartProjection)
                .exec(function(err, docs) {
                    if(err) {
                        toSend.result = "err";
                    } else {
                        toSend.result = "success";
                        toSend.data = docs;
                    }
                    res.json(toSend);
                    
                })
        } else {
            toSend.result = "noAuth";
            res.json(toSend);
        }
    }
    this.newChart = function(req, res) {
        var toSend = {};
        if(req.isAuthenticated()) {
            //console.log(req);
            var newData = {};
            req.body.options.forEach(function(item) {
                newData[item] = 0;
            })
            
            var newChart = new Charts();
            newChart.authorId = req.user.github.id;
            newChart.title = req.body.title;
            newChart.voters = [];
            newChart.data = newData;
            newChart.save(function(err, doc) {
                if(err) {
                    toSend = {result : "err"};
                } else {
                    toSend = {result: "success", chartId: doc.id};
                }
                res.json(toSend);
            })
            
        } else {
            toSend = {result : "noAuth"};
            res.json(toSend);
        }
    }

    
    this.getChart = function(req, res) {
        var chartProjection = {
            '_id' : true,
            'title': true,
            'data' : true,
            'authorId':true
        };
        Charts
            .find({_id: req.params.id}, chartProjection)
            .exec(function(err, result) {
                if(err) {
                    throw err;
                }
                res.json(result);
            });
    }
    this.idExists = function(req, res, next) {
        Charts
            .find({_id : req.params.id},{'_id': true})
            .exec(function(err, result) {
                if(err || result.length == 0) {
                    res.redirect('/');
                } else {
                    next();
                }

            })
    }
    // Checks if user owns the chart
    this.ownerCheck = function(req, res) {
        var toSend = {result: false};
        if(req.isAuthenticated()) {
            Charts
                .find({_id: req.params.id}, {'authorId' : true})
                .exec(function(err, result) {
                    if(err) {
                        throw err;
                    }
                    if(result.length ==0 || result[0].authorId != req.user.github.id) {
                        toSend.result = false;
                    } else {
                        toSend.result = true;
                    }
                    res.json(toSend);
                })
        } else {
            toSend.result = false;
            res.json(toSend);
        }
    }
    this.deleteHandler = function(req, res) {
        var toSend;
        if(req.isAuthenticated()) {
            Charts
                .find({_id : req.params.id}, {'authorId' : true})
                .exec(function(err, result) {
                   if(err) {
                       toSend = {result : "err"};
                       res.json(toSend);
                   } else if(result.length == 0) {
                       toSend = {result : "noChart"};
                       res.json(toSend);
                   } else {
                       // Check if chart was created by user
                       if(result[0].authorId == req.user.github.id) {
                           Charts
                                .remove({_id : req.params.id})
                                .exec(function(err) {
                                    if(err) {
                                        toSend ={result : "err"}
                                    } else {
                                        toSend = {result : "success"};
                                    }
                                    res.json(toSend);
                                })
                       } else {
                           toSend = {result : "noAuth"};
                           res.json(toSend);
                       }
                   }
                });
        } else {
            toSend = {result : "noAuth"};
            res.json(toSend);
        }
    }
    
    this.choiceHandler = function(req, res) {
        var toSend = {};
        Charts
            .find({_id : req.params.id}, {'_id' : true, 'authorId' : true, 'data': true, 'voters': true})
            .exec(function(err, result) {
                // Validate id first
                if(err) {
                    console.log("err1");
                    toSend = {result : "err"};
                }else if(result.length == 0) {
                    toSend = {result : "noChart"};
                } else {
                    // Now validate choice
                    var chart = result[0];
                    var canVote;
                    var ip = req.headers['x-forwarded-for'] || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress ||
                            req.connection.socket.remoteAddress;
                    var id = ip;

                    // Checks if user has already voted on this chart
                    if(req.isAuthenticated()) {
                        var id = req.user.github.id;
                        if(chart.voters.indexOf(req.user.github.id) != -1 || chart.voters.indexOf(ip) != -1) {
                            canVote = false;
                        } else {
                            canVote = true;
                        }
                    } else {
                        if(chart.voters.indexOf(ip) != -1) {
                            canVote = false;
                        } else {
                            canVote = true;
                        }
                    }
                    if(Object.keys(chart.data).indexOf(req.params.choice) == -1 && req.isAuthenticated() && canVote) {
                        var newData = chart;
                        newData.data[req.params.choice] = 1;
                        Charts.update({_id : req.params.id}, {$set : {data : newData.data, voters: newData.voters}})
                        .exec(function(err) {
                            if(err) {
                                console.log("err2");
                                toSend = {result : "err"};
                            } else {
                                toSend = {result : "success"};
                            }
                            res.json(toSend);
                        })
                    } else if(Object.keys(chart.data).indexOf(req.params.choice) == -1){
                        toSend = {result: "noChoice"}
                        res.json(toSend);
                    }else if(!canVote) {
                        toSend = {result : "noVote"};
                        res.json(toSend);
                    } else {
                        // Update chart
                        var newData = chart;
                        newData.voters.push(id);
                        newData.data[req.params.choice]++;
                        Charts.update({_id : req.params.id}, {$set : {data : newData.data, voters: newData.voters}})
                        .exec(function(err) {
                            if(err) {
                                toSend = {result: "err"};
                            } else {
                                toSend={result: "success"};
                            }
                            res.json(toSend);
                        });
                    }
                }
            });
    }
    this.isOwner = function(req, res, next) {
        var toSend ={};
        if(req.isAuthenticated()) {
            Charts
                .find({_id: req.params.id}, {'authorId' : true})
                .exec(function(err, result) {
                   if(err || result.length == 0) {
                       req.isOwner = false;
                       //throw err;
                   } else {
                       req.isOwner = false;
                   }
                   next();
                   
                   
                });
        } else {
            req.isOwner = false;
            next();
        }
    }
}

module.exports = ClickHandler;
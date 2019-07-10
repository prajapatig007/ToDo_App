var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require("body-parser");
var redis = require('redis');

var app = express();

var client = redis.createClient();

client.on('connect', function () {
    console.log('Redis Server connected...');
});

console.log(__dirname);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    //console.log("tasks");
    client.lrange('tasks', 0, -1, function(err, reply){
       // console.log(reply);
        res.render('index', {
            tasks: reply
        });
    })
});

app.post('/task/add', function(req, res){
    var task = req.body.task;
    client.rpush('tasks', task, function(err, reply){
        if(err)
            console.log("Error");
        console.log("Task added!");
        res.redirect('/');
    });
});




app.post('/task/del', function(req, res){
    var tasksToDel = req.body.tasks;
    client.lrange('tasks', 0, -1, function(err, tasks){
        for(var i=0; i<tasks.length; i++){
            if(tasksToDel.indexOf(tasks[i]) > -1)
            client.lrem('task', 0, tasks[i], function()
            {
                if(err)
                    console.log("ERROR");
            });
        }
        res.redirect('/');
    });
});


app.post('/call/add', function(req, res){
    var newCall = {}
    newCall.name = req.body.name;
    newCall.company = req.body.company;
    newCall.phone = req.body.phone  

    client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone], function(err, reply){
        if(err)
            console.log(err);
        console.log(reply);
        res.redirect('/');
});
});

app.listen(3000);
console.log("server started at port 3000...");

module.express = app;
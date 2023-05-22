//datadog
process.env.DD_ENV = 'uat';
process.env.DD_SERVICE = 'todo';
process.env.DD_VERSION = '1.0';
process.env.DD_LOGS_INJECTION = true;
process.env.DD_PROFILING_ENABLED=true;
const tracer = require('dd-trace').init({logInjection: true});
const span = tracer.scope().active();
//datadog

function getElapsed(start) {
  let elapsedmsec = (Date.now() - start)/1000;
  return elapsedmsec
}

//require the just installed express app
var express = require('express');
var bodyParser = require("body-parser");
var app = express();

//logging
var logdate = new Date();
var logyear = logdate.getFullYear();
var logmonth = String(logdate.getMonth() + 1).padStart(2, '0');
var logday = String(logdate.getDate()).padStart(2, '0');
const logfile = `logs/${logmonth}${logday}${logyear}-todo.log`;
const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  level: 'debug',
  transports: [new transports.File({filename: logfile})],
});
// logging end

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// use css
app.use(express.static('./public'));

// placeholder tasks
var task = [];
var complete = [];

//here we go
logger.info("System launch");
// add a task
app.post('/addtask', function (req, res) {
  try {
//    console.log(span.context());
    let start = Date.now();
    var newTask = req.body.newtask;
    if (newTask.length > 0) {
      logger.info('added ' + newTask + ' to the todo list!')
      task.push(newTask);
    } else {
      logger.error('item was empty and not added to the todo list!')
    }
    res.redirect("/");
    let dataline = 'time to add ' + newTask + ': ' + getElapsed(start) + ' msecs'
    logger.info(dataline);
  } 
  catch(e) 
  {
    logger.error(e.stack);
  }
});

// complete a task
app.post("/deletetask", function(req, res) {
  try {
    let start = Date.now();
    var completeTask = req.body.check;
    if (typeof completeTask === "string") {
      complete.push(completeTask);
      task.splice(task.indexOf(completeTask), 1);
      logger.info('completed ' + completeTask + ' in the todo list!')
      let dataline = 'time to complete ' + completeTask + ': ' + getElapsed(start) + ' msecs'
      logger.info(dataline);
    }
    else if (typeof completeTask === "object") {
      for (var i = 0; i < completeTask.length; i++) {
      complete.push(completedTask[i]);
      logger.info('completed ' + completeTask[i] + ' in the todo list!')
      task.splice(task.indexOf(completeTask[i]), 1);
      let dataline = 'time to complete ' + completeTask[i] + ': ' + getElapsed(start) + ' msecs'
      logger.info(dataline);
      }
    }
  }
  catch(e)
  {
    logger.error(e.stack);
  }
  res.redirect("/");
});

// get website files
app.get("/", function (req, res) {
res.render("index", { task: task, complete: complete });
});

// listen for connections
app.listen(8080, function () {
  console.log('app listening on port 8080!')
  logger.info('app listening on port 8080!')
});

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

const employeeController = require('./controllers/employeeController')

app.get('/', function(req, res){
    console.log('request GET /');
    res.status(200).json("homepage");
})

app.post('/employee/absence/generate', employeeController.ProduceGenerateAbsence)
app.post('/employee/leave/generate', employeeController.ProduceGenerateLeave)
app.post('/employee/salary/generate', employeeController.ProduceGenerateNewSalary)

app.get('/employee/average_salary_by_title', employeeController.GetAverageSalaryByTitle)
app.get('/employee/average_age_by_title', employeeController.GetAverageAgeByTitle)

var server = app.listen(8081, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Server listening at http://%s:%s", host,port);
})
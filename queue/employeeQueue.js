const employeeController = require('./controllers/employeeController')
const redisConfig = require('../config/redis')
const queue = require('bull')
const queueConfig = require('../config/queue')

console.log("Starting Consumer...")

let employeeQueue = new queue(queueConfig.queueNameEmployee, redisConfig.option)

employeeQueue.process(function(job, done){
    setTimeout(() => {
        var result
        switch (job.data.method){
            case queueConfig.methodGenerateAbsence :
                console.log("generating absence")
                result = employeeController.generateAbsenceFunction()
                break
            case queueConfig.methodGenerateLeave :
                console.log("generating leave")
                result = employeeController.generateLeaveFunction()
                break
            case queueConfig.methodGenerateNewSalary :
                console.log("generating new salary")
                result = employeeController.generateNewSalaryFunction(job.data.covidToggle)
                break
        }

        result.then(function(){
            console.log("job done")
            done()
        })
        .catch(function(err){
            console.log("job error " + err)
            done(new Error('error in %s : %v', job.data.method, err));
        })
    }, 3000)
})
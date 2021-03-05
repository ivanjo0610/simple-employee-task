const titleModel = require('../models/titleModel')
const employeeModel = require('../models/employeeModel')

const redisConfig = require('../config/redis')
const queue = require('bull')
const queueConfig = require('../config/queue')
const pool = require('../config/db')

let employeeQueue = new queue(queueConfig.queueNameEmployee, redisConfig.option)

exports.ProduceGenerateAbsence = (req, res) => {
    try{
        employeeQueue.add({method: queueConfig.methodGenerateAbsence})
        console.log("generate address proccess added")
        res.status(200).json({
            success: true,
            message: "success"
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
    
}

exports.ProduceGenerateLeave = (req, res) => {
    try{
        employeeQueue.add({method: queueConfig.methodGenerateLeave})
        console.log("generate leave proccess added")
        res.status(200).json({
            success: true,
            message: "success"
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
    
}

exports.ProduceGenerateNewSalary = (req, res) => {
    try{
        employeeQueue.add({method: queueConfig.methodGenerateNewSalary, covidToggle: req.body.covidToggle})
        console.log("generate new salary proccess added")
        res.status(200).json({
            success: true,
            message: "success"
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
}

exports.GetAverageSalaryByTitle = (req, res) => {
    console.log("get average salary by title hitted")

    //precision method will be select all employee -> get latest title & salary from each employee -> add it to an array with title as key
    let getTotalSalaryByTitle = titleModel.GetTotalSalaryByTitle(pool)
    getTotalSalaryByTitle.then(function(result){
        let data = []
        for(x = 0;x < result.length; x++){
            let dt = {
                label: result[x].title,
                y: Math.floor(result[x].totalSalary / result[x].employeeCount)
            }

            data.push(dt)
        }

        console.log("get average salary by title done")

        res.status(200).json({
            success: true,
            message: data
        })
    })
    .catch(function(err){
        res.status(500).json({
            success: false,
            message: err
        })
    })
}

exports.GetPreciseAverageSalaryByTitle = (req, res) => {
    console.log("get average salary by title hitted")

    try{
        pool.getConnection((err, connection) => {
            if(err){
                throw err
            }

            let resultEmployees = employeeModel.GetEmployees2(connection)
            let list = {}
            let data = []
    
            resultEmployees
                .on('error', function(err) {
                    throw err
                })
                .on('result', function(row) {
                    connection.pause()

                    let getLatestSalaryAndTitle = employeeModel.GetLatestSalaryAndTitle(pool, row.emp_no)
                    getLatestSalaryAndTitle.then(function(result){
                        let [res] = result
                        if(list.hasOwnProperty(res.title)){
                            list[res.title].totalSalary += res.salary
                            list[res.title].employeeCount++
                        }else{
                            list[res.title] = {
                                totalSalary: res.salary,
                                employeeCount: 1
                            }
                        }
                    })
                    .catch(function(err){
                        throw err
                    })

                    connection.resume()
                })
                .on('end', function(){
                    for (var key in list) {
                        let dt = {
                            label: key,
                            y: Math.floor(list[key].totalSalary / list[key].employeeCount)
                        }
            
                        data.push(dt)
                    }

                    console.log("done")
                    connection.release()

                    res.status(200).json({
                        success: true,
                        message: data
                    })
                })
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: err
        })
    }
}

exports.GetAverageAgeByTitle = (req, res) => {
    console.log("get average age by title hitted")

    //precision method will be select all employee -> get latest title & salary from each employee -> add it to an array with title as key
    let getTotalAgeByTitle = titleModel.GetTotalAgeByTitle(pool)
    getTotalAgeByTitle.then(function(result){
        let data = []
        for(x = 0;x < result.length; x++){
            let dt = {
                label: result[x].title,
                y: Math.floor(result[x].totalAge / result[x].employeeCount)
            }

            data.push(dt)
        }

        console.log("get average age by title done")

        res.status(200).json({
            success: true,
            message: data
        })
    })
    .catch(function(err){
        res.status(500).json({
            success: false,
            message: err
        })
    })
}
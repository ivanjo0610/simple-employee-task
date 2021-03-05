const titleModel = require('../models/titleModel')

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
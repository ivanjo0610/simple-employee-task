const employeeModel = require('../models/employeeModel')
const absenceModel = require('../models/absenceModel')
const pool = require('../config/db')
const redisConfig = require('../config/redis')
const queue = require('bull')

const methodGenerateAbsence = "generate_absence"

let employeeQueue = new queue('employee process', redisConfig.option)

exports.ProduceGenerateAbsence = (req, res) => {
    employeeQueue.add({method: methodGenerateAbsence})
}

employeeQueue.process(function(job, done){
    console.log("bopot")
    var result
    switch (job.data.method){
        case methodGenerateAbsence :
            console.log("generating absence")
            result = {success: true, message:""}
            // result = generateAbsenceFunction()
            break
        default:
            break
    }

    if(result.success){
        console.log("job done")
        done()
    }else{
        console.log("job error " + result.message)
        done(new Error('error in %s : %v', job.data.method, result.message));
    }
})

let generateAbsenceFunction = () => {
    //get employee count
    var employeeCount
    let resultCount = employeeModel.GetCount(pool)
    resultCount.then(function(result){
        employeeCount = result[0].count
        console.log("employees count: %d", employeeCount)

        //stream employee
        const limit = 1000
        
        try{
            pool.getConnection((err, connection) => {
                if(err){
                    throw err
                }

                let resultEmployees = employeeModel.GetEmployees2(connection)
        
                resultEmployees
                    .on('error', function(err) {
                        console.log("err in getemployees: " + err)
                        throw err
                    })
                    .on('result', function(row) {
                        connection.pause()
                        //set absen 30 hari kebelakang
                        console.log("employee %d:", row.emp_no)

                        now = new Date()
                        let input_data = ""
                        for(dayCount = 0 ; dayCount < 90; dayCount++){
                            let date = new Date(now.getTime() - (86400000 * dayCount));
                            //check if weekend
                            if(date.getDay() == 0 || date.getDay() == 6)
                                continue

                            let startHour = Math.floor(Math.random() * 4) + 8 //random 8 - 11
                            let endHour = Math.floor(Math.random() * 4) + 17 //random 17 - 20

                            let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, 0, 0, 0)
                            let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, 0, 0, 0)

                            let data = {
                                emp_no: row.emp_no,
                                start_date: Math.floor(startDate.getTime()/1000),
                                end_date: Math.floor(endDate.getTime()/1000),
                                break_time: (Math.floor(Math.random() * 91) * 60), //random 0 - 90
                            }
                            
                            if(input_data == ""){
                                input_data = `(${data.emp_no}, ${data.start_date}, ${data.end_date}, ${data.break_time})`
                            }else{
                                input_data = input_data + `,(${data.emp_no}, ${data.start_date}, ${data.end_date}, ${data.break_time})`
                            }
                        }

                        let insertAbsence =  absenceModel.InsertBatch(pool, input_data)
                        insertAbsence.then(function(insertAbsenceResult){
                            console.log("employee absence added")
                            console.log("employee %d: done", row.emp_no)
                            connection.resume()
                        })
                        .catch(function(err){
                            console.log("error")
                            console.log(err)
                            throw err
                        })
                    })
                    .on('end', function(){
                        console.log("done")
                        connection.release()
                    })
                
                return {success: true, message: ""}
            })
        }catch(err){
            console.log(err)
            return {success: false, message: err}
        }
        
    }).catch(function(err){
        console.log(err)
        return {success: false, message: err}
    })
}

exports.GenerateAbsence = (req, res) => {
    //get employee count
    var employeeCount
    let resultCount = employeeModel.GetCount(pool)
    resultCount.then(function(result){
        employeeCount = result[0].count
        console.log("employees count: %d", employeeCount)

        //stream employee
        const limit = 1000
        
        try{
            pool.getConnection((err, connection) => {
                if(err){
                    throw err
                }

                let resultEmployees = employeeModel.GetEmployees2(connection)
        
                resultEmployees
                    .on('error', function(err) {
                        console.log("err in getemployees: " + err)
                        throw err
                    })
                    .on('result', function(row) {
                        connection.pause()
                        //set absen 30 hari kebelakang
                        console.log("employee %d:", row.emp_no)

                        now = new Date()
                        let input_data = ""
                        for(dayCount = 0 ; dayCount < 90; dayCount++){
                            let date = new Date(now.getTime() - (86400000 * dayCount));
                            //check if weekend
                            if(date.getDay() == 0 || date.getDay() == 6)
                                continue

                            let startHour = Math.floor(Math.random() * 4) + 8 //random 8 - 11
                            let endHour = Math.floor(Math.random() * 4) + 17 //random 17 - 20

                            let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, 0, 0, 0)
                            let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, 0, 0, 0)

                            let data = {
                                emp_no: row.emp_no,
                                start_date: Math.floor(startDate.getTime()/1000),
                                end_date: Math.floor(endDate.getTime()/1000),
                                break_time: (Math.floor(Math.random() * 91) * 60), //random 0 - 90
                            }
                            
                            if(input_data == ""){
                                input_data = `(${data.emp_no}, ${data.start_date}, ${data.end_date}, ${data.break_time})`
                            }else{
                                input_data = input_data + `,(${data.emp_no}, ${data.start_date}, ${data.end_date}, ${data.break_time})`
                            }
                        }

                        let insertAbsence =  absenceModel.InsertBatch(pool, input_data)
                        insertAbsence.then(function(insertAbsenceResult){
                            console.log("employee absence added")
                            console.log("employee %d: done", row.emp_no)
                            connection.resume()
                        })
                        .catch(function(err){
                            console.log("error")
                            console.log(err)
                            throw err
                        })
                    })
                    .on('end', function(){
                        console.log("done")
                        connection.release()
                    })
                
                res.status(200).json({
                    success: true,
                    message: "success"
                })
                return
            })
        }catch(err){
            console.log(err)
            res.status(500).json({
                success: false,
                message: err
            })
        }
        
    }).catch(function(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: err
        })
        return
    })

}

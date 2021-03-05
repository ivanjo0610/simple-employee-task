const employeeModel = require('../../models/employeeModel')
const absenceModel = require('../../models/absenceModel')
const leaveModel = require('../../models/leaveModel')
const salaryModel = require('../../models/salaryModel')

const dateHelper = require('../../helper/date')

const pool = require('../../config/db')
const e = require('express')

exports.generateAbsenceFunction = () => {
    return new Promise(function(resolve, reject) {
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
                        resolve()
                    })
            })
        }catch(err){
            console.log(err)
            reject(err)
        }
    });
}

exports.generateLeaveFunction = () => {
    return new Promise(function(resolve, reject) {
            
        try{
            const leaveType = ['Annual', 'Maternity', 'Sick', 'Unpaid']

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
                        
                        console.log("employee %d:", row.emp_no)
                        leaveCount = Math.floor(Math.random() * 4) //random 0 - 3

                        now = new Date()
                        let input_data = ""
                        for(ctr = 0 ; ctr < leaveCount; ctr++){
                            //randomize leave type
                            var randomType, startDate
                            do {
                                randomType = Math.floor(Math.random() * 4) //random 0 - 3
                            }while(randomType == 1 && row.gender == 'M') //can't be male & maternity leave

                            do{
                                startDate = new Date(now.getFullYear(), now.getMonth()-ctr, Math.floor(Math.random() * 29), 0, 0, 0, 0)
                            }while(startDate.getDay() == 0 || startDate.getDay() == 6) //can't be weekend
                            
                            let endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 0, 0, 0)

                            let data = {
                                emp_no: row.emp_no,
                                start_date: Math.floor(startDate.getTime()/1000),
                                end_date: Math.floor(endDate.getTime()/1000),
                                type: leaveType[randomType], //random 0 - 90
                            }
                            
                            if(input_data == ""){
                                input_data = `(${data.emp_no}, ${data.start_date}, ${data.end_date}, '${data.type}')`
                            }else{
                                input_data = input_data + `,(${data.emp_no}, ${data.start_date}, ${data.end_date}, '${data.type}')`
                            }
                        }

                        if(input_data == ""){
                            console.log("employee %d: done", row.emp_no)
                            connection.resume()
                        }else{
                            let insertLeave =  leaveModel.InsertBatch(pool, input_data)
                            insertLeave.then(function(insertLeaveResult){
                                console.log("employee leave added")
                                console.log("employee %d: done", row.emp_no)
                                connection.resume()
                            })
                            .catch(function(err){
                                console.log("error")
                                console.log(err)
                                throw err
                            })
                        }
                    })
                    .on('end', function(){
                        console.log("done")
                        connection.release()
                        resolve()
                    })
            })
        }catch(err){
            console.log(err)
            reject(err)
        }
    });
}

exports.generateNewSalaryFunction = (covidToggle) => {
    return new Promise(function(resolve, reject) {
        try{
            pool.getConnection((err, connection) => {
                if(err){
                    throw err
                }

                let resultEmployees = employeeModel.GetEmployeesDetail(connection)
        
                resultEmployees
                    .on('error', function(err) {
                        console.log("err in GetEmployeesDetail: " + err)
                        throw err
                    })
                    .on('result', function(row) {
                        connection.pause()
                        
                        let workingHourDetail = absenceModel.GetWorkingHourDetail(pool, row.emp_no)
                        workingHourDetail.then(function(result){
                            console.log(`Employee number: ${row.emp_no}`)
                            console.log(`Employee title: ${row.title}`)
                            console.log(`Employee salary: ${row.salary}`)
                            console.log(`Employee working day: ${result[0].working_day}`)
                            console.log(`Employee total working hour: ${result[0].total_working_hour}`)
                            console.log(`Employee total break time: ${result[0].total_break_time}`)

                            if(dateHelper.formatSQLDate(Date.now()) != row.from_date){
                                let raise_percentage = 0
                                let raise = 0
                                let average_working_hour = (result[0].total_working_hour / result[0].working_day) / 3600
                                if(average_working_hour > 10){
                                    raise_percentage += 5
                                }else if(average_working_hour > 8){
                                    raise_percentage += 2.5
                                }else if (average_working_hour > 7){
                                    raise_percentage += 0.5
                                }

                                let average_break_time = (result[0].total_break_time / result[0].working_day) / 60
                                if(average_break_time > 60){
                                    raise_percentage -= 1
                                }else if(average_break_time < 60){
                                    raise_percentage +=1.5
                                }

                                if(row.title.toLowerCase() == 'staff'){
                                    raise_percentage += 1
                                }else if(row.title.toLowerCase() == 'senior engineer'){
                                    raise_percentage += 3
                                }else if(row.title.toLowerCase() == 'engineer'){
                                    raise_percentage += 2
                                }else if(row.title.toLowerCase() == 'assistant engineer'){
                                    raise_percentage += 2.5
                                }else if(row.title.toLowerCase() == 'technical leader'){
                                    raise_percentage += 4
                                }else{
                                    raise = 1000
                                }

                                if(covidToggle){
                                    raise_percentage -= 1
                                }

                                raise = raise + Math.floor(row.salary * raise_percentage / 100)
                                if(raise < 0){
                                    raise = 0
                                }
                                if(raise > 2000){
                                    raise = 2000
                                }

                                console.log(`employee raise percentage: ${raise_percentage}`)
                                console.log(`employee raise: ${raise}`)

                                //input to db 
                                let dataNewSalary = {
                                    emp_no: row.emp_no,
                                    salary: row.salary + raise
                                }
                                let setNewSalaryRes = setNewSalary(pool, dataNewSalary)
                                setNewSalaryRes.then(function(){
                                    console.log(`Employee number: ${row.emp_no} - done`)
                                    connection.resume()
                                })
                                .catch(function(err){
                                    throw err
                                })
                            }else{
                                console.log(`Employee number: ${row.emp_no} - done`)
                                connection.resume()
                            }
                        
                        })
                        .catch(function(err){
                            throw err
                        })
                    })
                    .on('end', function(){
                        console.log("done")
                        connection.release()
                        resolve()
                    })
                
            })
        }catch(err){
            console.log(err)
            reject(err)
        }
    });
}

function setNewSalary(pool, dataNewSalary){
    return new Promise(function(resolve, reject) {
        pool.getConnection((err, connection) => {
            if(err){
                reject(err)
            }
            connection.beginTransaction(function(err) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        reject(err)
                    });
                } else {
                    let updateLastSalary = salaryModel.UpdateLastSalary(connection, dataNewSalary.emp_no)
                    updateLastSalary.then(function(result){

                        let setNewSalary = salaryModel.SetNewSalary(connection, dataNewSalary.emp_no, dataNewSalary.salary)
                        setNewSalary.then(function(result){

                            connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function() {
                                        connection.release();
                                        reject(err)
                                    });
                                } else {
                                    connection.release();
                                    resolve()
                                }
                            });
                        })
                        .catch(function(err){
                            connection.rollback(function() {
                                connection.release();
                                reject(err)
                            });
                        })

                    })
                    .catch(function(err){
                        connection.rollback(function() {
                            connection.release();
                            reject(err)
                        });
                    })

                }    
            });
        })
    });
}
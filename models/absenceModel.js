exports.Insert = (pool, data) => {
    return new Promise(function(resolve, reject) {
        var sql = `insert into absence set ?`;
        pool.query(sql, [data], (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}

exports.InsertBatch = (pool, data) => {
    return new Promise(function(resolve, reject) {
        var sql = `insert into absence(emp_no, start_date, end_date, break_time) values ` + data;
        pool.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}

exports.GetWorkingHourDetail = (pool, emp_no) => {
    return new Promise(function(resolve, reject){
        var sql = `
        select 
            COUNT(start_date) as working_day, 
            SUM(end_date - start_date) as total_working_hour, 
            SUM(break_time) as total_break_time
        from 
            absence
        where 
            emp_no = ${emp_no}`

        pool.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result)
        })
    })
}
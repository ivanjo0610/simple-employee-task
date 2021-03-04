exports.InsertBatch = (pool, data) => {
    return new Promise(function(resolve, reject) {
        var sql = 'insert into `leave`(emp_no, start_date, end_date, type) values ' + data;
        pool.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}
const dateHelper = require('../helper/date')

exports.UpdateLastSalary = (connection, emp_no) => {
    return new Promise(function(resolve, reject) {
        var sql = `
            update
                salaries
            set
                to_date = '${dateHelper.formatSQLDate(Date.now())}'
            where
                emp_no = ${emp_no} AND
                to_date = '9999-01-01'
        `;
        connection.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}

exports.SetNewSalary = (connection, emp_no, salary) => {
    return new Promise(function(resolve, reject) {
        var sql = `
            insert into
                salaries
            values
                (${emp_no}, ${salary}, '${dateHelper.formatSQLDate(Date.now())}', '9999-01-01')
        `;
        connection.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}
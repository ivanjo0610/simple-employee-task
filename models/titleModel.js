exports.GetTotalSalaryByTitle = (connection) => {
    return new Promise(function(resolve, reject){
        var sql= `
            select
                t.title,
                Count(s.emp_no) as employeeCount,
                SUM(s.salary) as totalSalary
            from
                salaries s,
                titles t
            where
                s.emp_no = t.emp_no AND
                s.to_date = '9999-01-01' AND
                t.to_date = '9999-01-01'
            group by
                t.title
        `;

        connection.query(sql, (err, result)=> {
            if(err) reject(err);

            resolve(result)
        })
    })
}

exports.GetTotalAgeByTitle = (connection) => {
    return new Promise(function(resolve, reject){
        var sql= `
            select
                t.title,
                COUNT(e.emp_no) as employeeCount,
                SUM(YEAR(CURRENT_TIMESTAMP) - YEAR(e.birth_date) - (RIGHT(CURRENT_TIMESTAMP, 5) < RIGHT(e.birth_date, 5))) as totalAge
            from
                employees e,
                titles t
            WHERE
                e.emp_no = t.emp_no AND
                t.to_date = '9999-01-01'
            GROUP BY
                t.title
        `;

        connection.query(sql, (err, result)=> {
            if(err) reject(err);

            resolve(result)
        })
    })
}
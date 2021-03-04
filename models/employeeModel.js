exports.GetCount = (pool) => {
    return new Promise(function(resolve, reject) {
        var sql = `select count(*) as count from employees`;
        pool.query(sql, (err, result)=> {
            if (err) reject(err);

            resolve(result);
        });
    });
}

exports.GetEmployees = (pool, limit, offset) => {
    var sql = `select * from employees order by emp_no limit ${limit} offset ${offset}`;
    return pool.query(sql);
}

exports.GetEmployees2 = (pool) => {
    var sql = `select * from employees order by emp_no`;
    return pool.query(sql);
}

exports.GetEmployeesDetail = (pool) => {
    var sql = `
    select 
        e.emp_no, 
        s.salary,
        s.from_date,
        t.title
    from 
        employees e, 
        salaries s,
        titles t
    where 
        e.emp_no = s.emp_no AND
        e.emp_no = t.emp_no AND
        s.to_date = '9999-01-01' AND
        t.to_date = '9999-01-01'
    order by 
        e.emp_no`;

    return pool.query(sql);
}
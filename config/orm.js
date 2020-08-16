var connection = require("./connection.js");
const { resolve } = require("path");

let orm = {
    selectFieldAndId: (selections, table) => {
        return new Promise((resolve, reject) => {
            let retArr = []
            let queryString = "SELECT ?? FROM ??";
            connection.query(queryString, [selections, table], (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                for (let i = 0; i < results.length; i++) {
                    retArr.push(`${results[i][selections[0]]} ID: ${results[i][selections[1]]}`)
                }
            };
                resolve(retArr)
            });
        })
    },
    selectIds: (selections, table) => {
        return new Promise((resolve, reject) => {
            let retArr = []
            let queryString = "SELECT ?? FROM ??";
            connection.query(queryString, [selections, table], (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    for (let i = 0; i < results.length; i++) {
                        retArr.push(results[i].id)
                    }
                };
                resolve(retArr)
            });
        })
    },
    viewTable: (table) => {
        return new Promise ((resolve, reject) => {
            let queryString = 'SELECT * FROM ??'
            connection.query(queryString, [table], (err,results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(results)
                }
            });
        });
    },
    updateEmployee: (roleID, empID) => {
        return new Promise ((resolve, reject) => {
            let queryString = 'UPDATE employee SET role_id = ? WHERE employee.id = ?'
            connection.query(queryString, [roleID, empID], (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(results)
                }
            });
        });
    },
    viewFunction: (query) => {
        return new Promise ((resolve, reject) => {
            connection.query(query, (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(results)
                }
            })
        });
    },
    viewRoles: () => {
        return new Promise ((resolve, reject) => {
            let queryString = ''
            connection.query(queryString, (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(results)
                }
            })
        })
    },
    getManagers: (selections, table) => {
        return new Promise((resolve, reject) => {
            let retArr = []
            let queryString = "SELECT ?? FROM ?? INNER JOIN role ON employee.role_id = role.id WHERE role.id = 1";
            connection.query(queryString, [selections, table], (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                for (let i = 0; i < results.length; i++) {
                    retArr.push(`${results[i][selections[0]]} ${results[i][selections[1]]}`)
                }
            };
                resolve(retArr)
            });
        })
    }
};

module.exports = orm;
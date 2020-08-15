var connection = require("./connection.js");

let orm = {
    selectTitles: (selections, table) => {
        return new Promise((resolve, reject) => {
            let retArr = []
            let queryString = "SELECT ?? FROM ??";
            connection.query(queryString, [selections, table], (err, results) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    for (let i = 0; i < results.length; i++) {
                        retArr.push(`${results[i].title} ID: ${results[i].id}`)
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
    }
};

module.exports = orm;
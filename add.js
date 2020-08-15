const inquirer = require('inquirer');
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

  // Your port; if not 3306
    port: 3306,

  // Your username
    user: "root",

  // Your password
    password: "yourRootPassword",
    database: "emp_mgmt"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

// CLASSES

class Role {
    constructor(role_desc, salary, dept_id) {
        this.role_desc = role_desc;
        this.salary = salary;
        this.dept_id = dept_id;
    };
    addRoleDB() {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",[this.role_desc, this.salary, this.dept_id],(err,res) => {
            if (err) throw err;
            console.log(res)
        });
    };
};

class Department {
    constructor(dept_name) {
        this.dept_name = dept_name;
    };
    addDeptDB() {
        connection.query("INSERT INTO department (name) VALUES (?)",[this.dept_name],(err,res) => {
            if (err) throw err;
            console.log(res)
        });
    };
};

class Employee {
    constructor(first_name, last_name, role_id, manager_id) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.manager_id = manager_id;
        this.role_id = role_id;
    };
    addEmployeeDB() {
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",[this.first_name, this.last_name, this.role_id, this.manager_id],(err, res) => {
            if (err) throw err;
            console.log(res)
        });
    };
};

// ADD FUNCTIONS

function addNewEmployee() {
    let questions = setEmpQuestions()
    inquirer.prompt(questions).then((answers) => {
        let newEmp = new Employee(answers.first_name, answers.last_name, answers.role_id)
        newEmp.addEmployeeDB()
    });
};

async function setEmpQuestions() {
    try {
    let choice = await getData('title', 'role')
    let newEmpQuestions = [
        {
            type: "prompt",
            name: "first_name",
            message: "What is the employees first name?",
        },
        {
            type: "prompt",
            name: "last_name",
            message: "What is the employees last name?",
        },
        {
            type: "list",
            name: "role_id",
            message: "What is the employee's role?",
            choices: choice
        },
    ];
    return newEmpQuestions
    } catch (err) {
        throw err
    };
};

// function addNewRole() {
//     getData("department_id", "role").then((respp) => {
//         inquirer.prompt([
//             {
//                 type: "prompt",
//                 name: "role_desc",
//                 message: "What role would you like to add?",
//             },
//             {
//                 type: "prompt",
//                 name: "salary",
//                 message: "What is the salary for this role?"
//             },
//             {
//                 type: "list",
//                 name: "dept_id",
//                 message: "What is the department ID?",
//                 choices: respp
//             }
//         ]).then((answers) => {
//             let newRole = new Role(answers.role_desc, answers.salary, answers.dept_id)
//             newRole.addRoleDB()
//         });
//     });
// };

// function addNewDept() {
//     inquirer.prompt([
//         {
//             type: "prompt",
//             name: "dept_name",
//             message: "What is the department name?"
//         }
//     ]).then((answers) => {
//         let newDept = new Department(answers.dept_name)
//         newDept.addDeptDB()
//     });
// };

// HELPER FUNCTIONS

function getData(select, table) {
    return new Promise((resolve, reject) => {
        let retArr = []
        connection.query(`SELECT ${select} FROM ${table}`, (err, res) => {
            if (err) {
                reject(new Error(err))
            } else {
                for (let i = 0; i < res.length; i++) {
                    retArr.push(res[i].title)
                }
            };
            resolve(retArr)
        });
    });
};

module.exports = {
    // newRole: addNewRole(),
    // newDept: addNewRole(),
    newEmp: addNewEmployee
}
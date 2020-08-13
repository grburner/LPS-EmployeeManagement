var mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
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
    startQuestions();
});

function startQuestions() {
    inquirer.prompt({
        name: "start_choice",
        type: "list",
        message: "What would you like to do?",
        choices: ["ADD NEW RECORD", "REMOVE OR EDIT RECORDS", "REVIEW RECORDS"]
    })
    .then((answer) => {
        if (answer.start_choice === "ADD NEW RECORD") {
            inquirer.prompt({
                name: "record_add",
                type: "list",
                message: "What would you like to add?",
                choices: ["NEW EMPLOYEE", "NEW DEPARTMENT", "NEW ROLE"]
            }).then((resp) => {
                if (resp.record_add === "NEW EMPLOYEE") {
                    addNewEmployee()
                } else if (resp.record_add === "NEW DEPARTMENT") {
                    addNewDept()
                } else if (resp.record_add === "NEW ROLE") {
                    addNewRole()
                }
            });
        };
    });
};

function addNewEmployee() {
    inquirer.prompt([
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
            type: "prompt",
            name: "role_id",
            message: "What is the employee's role?"
            //query DB to get active roles and return as choices
        },
        {
            type: "prompt",
            name: "manager_id",
            message: "What is the employee's manager ID?"
            //query DB to get active managers and return as choices
        }
    ]).then((answers) => {
        let newEmp = new Employee(answers.first_name, answers.last_name, answers.role_id, answers.manager_id)
        newEmp.addEmployeeDB()
    });
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

function addNewRole() {
    getRoles("department_id", "role").then((respp) => {
        inquirer.prompt([
            {
                type: "prompt",
                name: "role_desc",
                message: "What role would you like to add?",
            },
            {
                type: "prompt",
                name: "salary",
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "dept_id",
                message: "What is the department ID?",
                choices: respp
            }
        ]).then((answers) => {
            let newRole = new Role(answers.role_desc, answers.salary, answers.dept_id)
            newRole.addRoleDB()
        });
    });
};

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

function addNewDept() {
    inquirer.prompt([
        {
            type: "prompt",
            name: "dept_name",
            message: "What is the department name?"
        }
    ]).then((answers) => {
        let newDept = new Department(answers.dept_name)
        newDept.addDeptDB()
    });
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

getRoles = function(select, table) {
    return new Promise((resolve, reject) => {
        let retArr = []
        connection.query(`SELECT ${select} FROM ${table}`, (err, res) => {
            console.log(res)
            if (err) {
                reject(new Error(err))
            } else {
                for (let i = 0; i < res.length; i++) {
                    retArr.push(res[i].department_id)
                }
            };
            resolve(retArr)
        });
    });
};
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
                console.log(resp)
                if (resp.record_add === "NEW EMPLOYEE") {
                    console.log('into new employee')
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
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",[this.first_name, this.last_name, this.role_id, this.manager_id],function(err, res) {
            if (err) throw err;
            console.log(res)
        })
    }
};
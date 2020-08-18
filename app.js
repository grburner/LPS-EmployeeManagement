const mysql = require("mysql");
const inquirer = require("inquirer");
const orm = require("./config/orm.js");
var connection = require("./config/connection.js");
const { start } = require("repl");

//INQUIRER SCRIPT

function startQuestions() {
    inquirer.prompt({
        name: "start_choice",
        type: "list",
        message: "What would you like to do?",
        choices: ["ADD - NEW EMPLOYEE", "ADD - NEW ROLE", "ADD - NEW DEPT", "VIEW - EMPLOYEES", "VIEW - ROLES", "VIEW - DEPTS", "UPDATE - EMPLOYEE ROLES", "END"]
    })
    .then((answer) => {
        if (answer.start_choice === "ADD - NEW EMPLOYEE") {
            addNewEmployee()
        } else if (answer.start_choice === "ADD - NEW ROLE") {
            addNewRole()
        } else if (answer.start_choice === "ADD - NEW DEPT") {
            addNewDept()
        } else if (answer.start_choice === "VIEW - EMPLOYEES") {
            const query = 'SELECT employee.first_name AS FirstName, employee.last_name AS LastName, role.title AS Title, department.name AS Department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id'
            viewTable(query)
        } else if (answer.start_choice === "VIEW - ROLES") {
            const query = 'SELECT role.title AS Role, employee.first_name AS FirstName, employee.last_name AS LastName, role.salary AS Salary FROM employee INNER JOIN role ON employee.role_id = role.id ORDER BY Role desc'
            viewTable(query)
        } else if (answer.start_choice === "VIEW - DEPTS") {
            const query = 'SELECT department.name AS Dept, employee.first_name AS FirstName, employee.last_name AS LastName, role.salary AS Salary FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id ORDER BY Dept DESC'
            viewTable(query)
        } else if (answer.start_choice === "UPDATE - EMPLOYEE ROLES"){
            updateEmpRole()
        } else if (answer.start_choice === "END") {
            connection.end()
        }
    });
};

//CLASSES

class Employee {
    constructor(first_name, last_name, role_id, manager_id) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.manager_id = manager_id;
        this.role_id = role_id;
    };
    addEmployeeDB() {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",[this.first_name, this.last_name, this.role_id, this.manager_id],(err, res) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(console.log(`${this.first_name} ${this.last_name} added!`))
                }
            });
        });
    };
};

class Role {
    constructor(role_desc, salary, dept_id) {
        this.role_desc = role_desc;
        this.salary = salary;
        this.dept_id = dept_id;
    };
    addRoleDB() {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",[this.role_desc, this.salary, this.dept_id],(err,res) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(console.log(`${this.role_desc} added!`))
                }
            });
        });
    };
};   

class Department {
    constructor(dept_name) {
        this.dept_name = dept_name;
    };
    addDeptDB() {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO department (name) VALUES (?)",[this.dept_name],(err,res) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(console.log(`${this.dept_name} added!`))
                }
            });
        });
    };
};

// ADD NEW RECORD FUNCTIONS

async function addNewEmployee() {
    const roles =  await orm.selectFieldAndId(['title','id'], 'role');
    const managers = await orm.getManagers(['first_name', 'last_name', 'employee.id'], 'employee');
    Promise.all([roles, managers]).then(async (values) => {
        const resp = await inquirer.prompt(questionArr);
        let newEmp = new Employee(resp.first_name, resp.last_name, resp.role_id.slice(-1), resp.manager_id.slice(-1));
        newEmp.addEmployeeDB().then(() => {
            startQuestions()
        })
    })
    let questionArr = [
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
            choices: roles
        },
        {
            type: "list",
            name: "manager_id",
            message: "Who will the employee report to?",
            choices: managers
        }
    ];
};

async function addNewRole() {
    const depts = await orm.selectFieldAndId(['name', 'id'], 'department');
    let questionArr = [
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
            choices: depts
        }
    ]
    const resp = await inquirer.prompt(questionArr);
    let newRole = new Role(resp.role_desc, resp.salary, resp.dept_id.slice(-1));
    newRole.addRoleDB().then(() => {
        startQuestions()
    });
};

async function addNewDept() {
    let questionArr = [
        {
            type: "prompt",
            name: "dept_name",
            message: "What is the name of the Department you would like to add?"
        }
    ];
    const resp = await inquirer.prompt(questionArr);
    let newDept = new Department(resp.dept_name);
    newDept.addDeptDB().then(() => {
        startQuestions()
    });
};

//VIEW RECORD FUNCTIONS

async function viewTable(query) {
    const resp = await orm.viewFunction(query);
    console.table(resp);
    startQuestions();
}

//UPDATE FUNCTIONS

async function updateEmpRole() {
    const emps = await orm.selectFieldAndId(['first_name', 'id'], 'employee');
    const roles = await orm.selectFieldAndId(['title', 'id'], 'role');
    Promise.all([emps, roles]).then(async (values) => {
        const resp = await inquirer.prompt(questionArr);
        const results = await orm.updateEmployee(resp.role_update.slice(-1), resp.emp_update.slice(-1));
        console.log(`Employee: ${resp.emp_update}: Role updated to: ${resp.role_update}`);
        startQuestions();
    })
    let questionArr = [
        {
            type: "list",
            name: "emp_update",
            message: "What employee's role would you like to change?",
            choices: emps
        },
        {
            type: "list",
            name: "role_update",
            message: "What role would you like to switch to?",
            choices: roles
        }
    ];
};

startQuestions()

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
        choices: ["ADD - NEW EMPLOYEE", "ADD - NEW ROLE", "ADD - NEW DEPT", "VIEW - EMPLOYEES", "VIEW - ROLES", "VIEW - DEPTS", "UPDATE - EMPLOYEE ROLES", "UPDATE - EMPLOYEE MANAGERS", "END"]
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
            const query = 'SELECT employee.first_name AS FirstName, employee.last_name AS LastName, role.title AS Role, role.salary AS Salary FROM employee INNER JOIN role ON employee.role_id = role.id ORDER BY Role desc'
            viewTable(query)
        } else if (answer.start_choice === "VIEW - DEPTS") {
            const query = 'SELECT department.name AS Dept, employee.first_name AS FirstName, employee.last_name AS LastName, role.salary AS Salary FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id ORDER BY Dept DESC'
            viewTable(query)
        } else if (answer.start_choice === "UPDATE - EMPLOYEE ROLES"){
            updateEmpRole()
        } else if (answer.start_choice === "END") {
            return
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
    const managers = await orm.selectIds('id', 'employee');
    Promise.all([roles, managers]).then(async (values) => {
        const resp = await inquirer.prompt(questionArr);
        let newEmp = new Employee(resp.first_name, resp.last_name, resp.role_id.slice(-1), resp.manager_id);
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
            message: "who will the employee report to?",
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

// # Unit 12 MySQL Homework: Employee Tracker

// Developers are often tasked with creating interfaces that make it easy for non-developers to view and interact with information stored in databases. Often these interfaces are known as **C**ontent **M**anagement **S**ystems. In this homework assignment, your challenge is to architect and build a solution for managing a company's employees using node, inquirer, and MySQL.

// ## Instructions

// Design the following database schema containing three tables:

// ![Database Schema](Assets/schema.png)

// * **department**:

//   * **id** - INT PRIMARY KEY
//   * **name** - VARCHAR(30) to hold department name

// * **role**:

//   * **id** - INT PRIMARY KEY
//   * **title** -  VARCHAR(30) to hold role title
//   * **salary** -  DECIMAL to hold role salary
//   * **department_id** -  INT to hold reference to department role belongs to

// * **employee**:

//   * **id** - INT PRIMARY KEY
//   * **first_name** - VARCHAR(30) to hold employee first name
//   * **last_name** - VARCHAR(30) to hold employee last name
//   * **role_id** - INT to hold reference to role employee has
//   * **manager_id** - INT to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager
  
// Build a command-line application that at a minimum allows the user to:

//   * Add departments, roles, employees

//   * View departments, roles, employees

//   * Update employee roles

// Bonus points if you're able to:

//   * Update employee managers

//   * View employees by manager

//   * Delete departments, roles, and employees

//   * View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// We can frame this challenge as follows:

// ```
// As a business owner
// I want to be able to view and manage the departments, roles, and employees in my company
// So that I can organize and plan my business
// ```

// How do you deliver this? Here are some guidelines:

// * Use the [MySQL](https://www.npmjs.com/package/mysql) NPM package to connect to your MySQL database and perform queries.

// * Use [InquirerJs](https://www.npmjs.com/package/inquirer/v/0.2.3) NPM package to interact with the user via the command-line.

// * Use [console.table](https://www.npmjs.com/package/console.table) to print MySQL rows to the console. There is a built-in version of `console.table`, but the NPM package formats the data a little better for our purposes.

// * You may wish to have a separate file containing functions for performing specific SQL queries you'll need to use. Could a constructor function or a class be helpful for organizing these?

// * You will need to perform a variety of SQL JOINS to complete this assignment, and it's recommended you review the week's activities if you need a refresher on this.

// ![Employee Tracker](Assets/employee-tracker.gif)

// ### Hints

// * You may wish to include a `seed.sql` file to pre-populate your database. This will make development of individual features much easier.

// * Focus on getting the basic functionality completed before working on more advanced features.

// * Review the week's activities for a refresher on MySQL.

// * Check out [SQL Bolt](https://sqlbolt.com/) for some extra MySQL help.

// ## Minimum Requirements

// * Functional application.

// * GitHub repository with a unique name and a README describing the project.

// * The command-line application should allow users to:

//   * Add departments, roles, employees

//   * View departments, roles, employees

//   * Update employee roles

// ## Bonus

// * The command-line application should allow users to:

//   * Update employee managers

//   * View employees by manager

//   * Delete departments, roles, and employees

//   * View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// ## Commit Early and Often

// One of the most important skills to master as a web developer is version control. Building the habit of committing via Git is important for two reasons:

// * Your commit history is a signal to employers that you are actively working on projects and learning new skills.

// * Your commit history allows you to revert your codebase in the event that you need to return to a previous state.

// Follow these guidelines for committing:

// * Make single-purpose commits for related changes to ensure a clean, manageable history. If you are fixing two issues, make two commits.

// * Write descriptive, meaningful commit messages so that you and anyone else looking at your repository can easily understand its history.

// * Don't commit half-done work, for the sake of your collaborators (and your future self!).

// * Test your application before you commit to ensure functionality at every step in the development process.

// We would like you to have well over 200 commits by graduation, so commit early and often!


// ## Submission on BCS

// You are required to submit the following:

// * The URL of the GitHub repository

// * A video demonstrating the entirety of the app's functionality 

// - - -
// © 2019 Trilogy Education Services, a 2U, Inc. brand. All Rights Reserved.

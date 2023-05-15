const connection = require('./config/connection');
const inquirer = require('inquirer');
const table = require('console-table');
const validate = require('./validate/validate');
const figlet = require('figlet');
const chalk = require('chalk');
const { error } = require('console');

// Connect to database 

connection.connect((err) => {
if (err) return err;
console.log(chalk.red.bold(`====================================================================================`));
  console.log(``);
  console.log(chalk.blue.bold(figlet.textSync('Employee Tracker')));
  console.log(``);
   console.log(chalk.red.bold(`====================================================================================`));
userPrompt();
});

// Prompt for User Selection and Input

const userPrompt = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role'
            ] 
        }
    ])
    .then((response) => {
       

        if(response.choices === 'View all departments') {
            viewAllDepartments();
        }
        if(response.choices === 'View all roles') {
            viewAllRoles();
        }
        if(response.choices === 'View all employees') {
            viewAllEmployees();
        }
        if(response.choices === 'Add a department') {
            addADepartment();
        }
        if(response.choices === 'Add a role') {
            addARole();
        }
        if(response.choices === 'Add an employee') {
            addAnEmployee();
        }
        if(response.choices === 'Update an employee role') {
            updateAnEmployeeRole();
        }
           });
};

// View all deparments
const viewAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log(chalk.red.bold(`====================================================================================`));
        console.log(`                              ` + chalk.blue.bold(`All Departments:`));
        console.log(chalk.red.bold(`====================================================================================`));
        console.table(response);
        console.log(chalk.red.bold(`====================================================================================`));
        userPrompt();
    });
};

// View all roles
const viewAllRoles = () => {
    let sql = `SELECT role.id, role.title,
    role.salary,
    department.department_name AS 'department' FROM role, department WHERE department.id = role.department_id
    ORDER BY role.id ASC`;
    connection.query(sql, (err, response) => {
        if (err) return err;
        console.log(chalk.red.bold(`====================================================================================`));
        console.log(`                              ` + chalk.blue.bold(`All Roles:`));
        console.log(chalk.red.bold(`====================================================================================`));
      console.table(response);
    console.log(chalk.red.bold(`====================================================================================`));
userPrompt();
    });
};

// View all employees
const viewAllEmployees = () => {
    let sql = `SELECT employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    department.department_name AS 'department',
    role.salary,
    employee.manager_id
    FROM employee, role, department
    WHERE department.id = role.department_id
    AND role.id = employee.role_id
    ORDER BY employee.id ASC`;
connection.query(sql, (err, response) => {
    if (err) return err;
    console.log(chalk.red.bold(`====================================================================================`));
    console.log(`                              ` + chalk.blue.bold(`All Employees:`));
    console.log(chalk.red.bold(`====================================================================================`));
 
    console.table(response);
console.log(chalk.red.bold(`====================================================================================`));
userPrompt();
});
};

// Add a department

const addADepartment = () => {
    inquirer
    .prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'Please enter the name of new department',
            validate: validate.validateString
        }
    ])
    .then((answer) => {
const sql = `INSERT INTO department (department_name) VALUE (?)`;
connection.query(sql, answer.newDepartment, (err, response) => {
    if (err) return err;
    console.log('');
    console.log(chalk.blue(answer.newDepartment + `Department created!`));
    console.log('');
    viewAllDepartments();
});
 });
};

// Add a role

const addARole = () => {

    const sql = 'SELECT * FROM department'
    connection.query(sql, (err, response) => 
    { if (err) return err;
        let deparmentNameArray = [];
        response.forEach((department) => {deparmentNameArray.push(department.department_name);});
 deparmentNameArray.push('Create Department');
 inquirer
 .prompt([
    {
        name: 'roleDepartment',
        type: 'list',
        message: 'What department of the role?',
        choices: deparmentNameArray
    },
 ])
 .then((answer) => {
    if(answer.roleDepartment === 'Create Department') {
        this.addADepartment();
    } else {
addRoleName(answer);
    }

 });
 const addRoleName = (departmentData) => {
        inquirer
        .prompt([
            {
                name: 'roleName',
                type: 'input',
                message: 'What role would you like to add?',
                validate: validate.validateString
            },
            {
                name: 'roleSalary',
                type: 'input',
                message: 'What is the salary of the role?',
                validate: validate.validateSalary
            },
          
        ])
        .then((answer) => {
    let departmentId;
    response.forEach((department) => {
        if(departmentData.roleDepartment === department.department_name) {
            departmentId = department.id;
        }
    });
    
    
    
    
    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
    let crit = [answer.roleName, answer.roleSalary, departmentId];
    
    connection.query(sql, crit, (err) => {
        if (err) return err;
        console.log(chalk.red.bold(`====================================================================================`));
        console.log(chalk.blue(`Role successfully created!`));
        console.log(chalk.red.bold(`====================================================================================`));
        viewAllRoles();
    });
    
    
        })
    }
    })
}

const addAnEmployee = () => {
    inquirer
    .prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'What is the employee first name?',
            validate: addFirstName => {
                if (addFirstName) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'What is the employee last name?',
            validate: addLastName => {
                if (addLastName) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        }
    ])
    .then(answer => {
        const crit = [answer.firstName, answer.lastName]
        const roleSl = `SELECT role.id, role.title FROM role`;
        connection.query(roleSl, (err, data) => {
            if (err) return err;
            const roles = data.map(({id, title}) => ({ name: title, value: id }));
            inquirer
            .prompt([
                {
                    name: 'role',
                    type: 'list',
                    message: 'what is the employee role?',
                    choices: roles
                }
            ])
            .then(choiceRole => {
                crit.push(choiceRole.role);
                const selectManager = `SELECT * FROM employee`;
                connection.query(selectManager, (err, data) => {
                    if (err) return err;
                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                    inquirer
                    .prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: 'who is the employee manager?',
                            choices: managers
                        }
                    ])
                    .then(choiceManager => {
                        crit.push(choiceManager.manager);
                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                        connection.query(sql, crit, (err) => {
                            if (err) return err;
                            console.log('New employee added!')
                            viewAllEmployees();
                        })
                    })
                })
            }
                )
        })
    })
}

const updateAnEmployeeRole = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS role_id
    FROM employee, role, department WHERE department_id = role.department_id AND role.id = employee.role_id `;
    connection.query(sql, (err, response) => {
        if (err) return err;
        let employeeNamesArray = [];
        response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});
    let sql = `SELECT role.id, role.title FROM role`;
    connection.query(sql, (err, response) => {
        if (err) return err;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        inquirer
        .prompt(
            [
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Who has a new role?',
                    choices: employeeNamesArray
                },
                {
                    name: 'chosenRole',
                    type: 'list',
                    message: 'What is their new role?',
                    choices: rolesArray
                }
            ]
        )
        .then((answer) => {
            let newTitleId, employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            response.forEach((employee) => {
              if (
                answer.chosenEmployee ===
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log(chalk.greenBright.bold(`====================================================================================`));
                console.log(chalk.greenBright(`Employee Role Updated`));
                console.log(chalk.greenBright.bold(`====================================================================================`));
                userPrompt();
              }
            );
        })
    })
    
    
    
    })
}


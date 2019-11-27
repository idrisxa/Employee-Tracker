//Leave company 

//UPDATE user SET companyId = NULL WHERE id = 1;
const inquirer = require("inquirer");
const express = require('express');


const PORT = process.env.PORT || 8080;
const mysql = require('mysql');

const app = express();
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));



class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
  }
  
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "testtest",
    database: "employeesDB"
  });
  
async function main(){

departmentList = [];
roleList = [];
employeeList = [];
managerList = ["no manager"];
let Empdept_id;
let Emp_id;

    let employees = await db.query("SELECT * FROM employee");
        for (i = 0; i<employees.length; i++){
            employeeList.push(`${employees[i].firstName} ${employees[i].lastName}`);

        }

        let departments = await db.query("SELECT * FROM department");
        for (i = 0; i<departments.length; i++){
            departmentList.push(departments[i].name);
        }


    let response = await inquirer
            .prompt([
                    {
                        type: "list",
                        message: "Hello there! What would you like to do?",
                        name: "task",
                        choices:[
                            "Add departments, roles, employees",
                            "View departments, roles, employees",
                            "Update employee information",
                            "Delete departments, roles, employees",
                            ]
                    },
                    {
                        when: input => {
                            return input.task == "Add departments, roles, employees"
                                        },
                            type: "list",
                            name: "add",
                            message: "What would you like to add?",
                            choices:[
                                "Add departments",
                                "Add roles",
                                "Add employees"
                                ]
                        
                    },
                    {
                        when: input => {
                            return input.task == "View departments, roles, employees"
                                        },
                            type: "list",
                            name: "view",
                            message: "What would you like to view?",
                            choices:[
                                "View departments",
                                "View roles",
                                "View employees",
                                "View employees by manager",
                                "View the total utilized budget of a department"
                                ]
                        
                    },
                    {
                        when: input => {
                            return input.task == "Delete departments, roles, employees"
                                        },
                            type: "list",
                            name: "delete",
                            message: "What would you like to delete?",
                            choices:[
                                "Delete departments",
                                "Delete roles",
                                "Delete employees"
                                ]
                        
                    },
                ]);
 
    if (response.add == "Add departments"){
        console.log("prepared to add department");
        inquirer
        .prompt([
                {
                    type: "input",
                    message: "Please enter name of department to add",
                    name: "addDepartment"
                },
            ]).then(async (response)=>{
                await db.query(`INSERT INTO department (name) VALUES ('${response.addDepartment}')`);
                console.log("New department added");
                let addDepartment = await db.query("SELECT * FROM department");
                console.table(addDepartment);
                main();
            })
    }
    else if (response.add == "Add roles"){
        
        inquirer
        .prompt([
                {
                    type: "list",
                    message: "Please select department this role belongs to",
                    name: "addRole_department",
                    choices: departmentList
                },
                {
                    type: "input",
                    message: "Please enter role name",
                    name: "addRole",
                },
                {
                    type: "input",
                    message: "What is the salary for this role?",
                    name: "addRole_salary",
                }
            ]).then(async (response)=>{
                let dept_id = await db.query(`SELECT id FROM department WHERE name = '${response.addRole_department}'`);
                
                await db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${response.addRole}', ${response.addRole_salary}, ${dept_id[0].id})`);
                console.log("New role added");
                let addRole = await db.query("SELECT * FROM role");
                console.table(addRole);
                main();
            });

    }
    else if (response.add == "Add employees"){
        console.log("prepared to add employees");
        
        await inquirer
        .prompt([
                {
                    type: "list",
                    message: "Please select department this employee belongs to",
                    name: "addEmployee_department",
                    choices: departmentList
                }
            ]).then(async (response)=>{
                let roles = await db.query(`SELECT title FROM role INNER JOIN department ON role.department_id = department.id WHERE department.name = '${response.addEmployee_department}' `);
                Empdept_id = await db.query(`SELECT id FROM department WHERE name = '${response.addEmployee_department}'`);
                for (i = 0; i<roles.length; i++){
                roleList.push(roles[i].title);
                }
              


                let managersInDept = await db.query(`SELECT employee.firstName, employee.lastName FROM employee INNER JOIN role ON employee.role_id = role.id WHERE title = "Manager" AND department_id = ${Empdept_id[0].id};`);

    
                for (i = 0; i<managersInDept.length; i++){
                    managerList.unshift(`${managersInDept[i].firstName} ${managersInDept[i].lastName}`);
                   
                }
            })

        await inquirer
        .prompt([
                {
                    type: "list",
                    message: "Please select Manager for new Employee from Managers available in selected department or select No Manager",
                    name: "addEmployee_manager",
                    choices: managerList
                },
                {
                    type: "list",
                    message: "Please select employee role",
                    name: "addEmployee_role",
                    choices: roleList
                },
                {
                    type: "input",
                    message: "Please enter employee First Name",
                    name: "addEmployee_firstName",
                },
                {
                    type: "input",
                    message: "Please enter employee Last Name",
                    name: "addEmployee_lastName",
                }
            ]).then(async (response)=>{

                
                        let manager_firstName = response.addEmployee_manager.split(' ')[0];
                        let manager_lastName = response.addEmployee_manager.split(' ')[1];
            
                        let manager_id = await db.query(`SELECT id FROM employee WHERE firstName = '${manager_firstName}' AND lastName = '${manager_lastName}' `);
                        
                        let role_id = await db.query(`SELECT id FROM role WHERE title = '${response.addEmployee_role}' AND department_id = ${Empdept_id[0].id}`);
        
                         await db.query(`INSERT INTO employee (firstName, lastName, role_id, manager_id) VALUES ('${response.addEmployee_firstName}', '${response.addEmployee_lastName}', ${role_id[0].id}, ${manager_id[0].id})`);
                         console.log("New employee added");
                         let addEmployee = await db.query("SELECT * FROM employee");
                         console.table(addEmployee);
                         main();
            });
    }

    if (response.view == "View departments"){
        console.log("prepared to view department");
      
        console.table(departments);
        main();
    }
    else if (response.view == "View roles"){
        console.log("prepared to view roles");
        let roles = await db.query("SELECT * FROM role",);
        console.table(roles);
        main();
    }
    else if (response.view == "View employees"){
        console.log("prepared to view employees");
       
       console.table(employees);
       main();
            
    }
    else if (response.view == "View employees by manager"){
        console.log("prepared to view employees by manager");
        let mngrs = await db.query(`SELECT employee.firstName, employee.lastName FROM employee INNER JOIN role ON employee.role_id = role.id WHERE title = "Manager";`);

                for (i = 0; i<mngrs.length; i++){
                    managerList.unshift(`${mngrs[i].firstName} ${mngrs[i].lastName}`);
                 
                }

                await inquirer
                .prompt([
                {
                    type: "list",
                    message: "Which manager would you like to see employees under?",
                    name: "viewEmployee_manager",
                    choices: managerList
                },
            ]).then(async (response)=>{
                        let manager_firstName = response.viewEmployee_manager.split(' ')[0];
                        let manager_lastName = response.viewEmployee_manager.split(' ')[1];
                        let manager_id = await db.query(`SELECT id FROM employee WHERE firstName = '${manager_firstName}' AND lastName = '${manager_lastName}' `);
                        let employeeByManager = await db.query(`SELECT * FROM employee WHERE manager_id = ${manager_id[0].id} `);
                        console.table(employeeByManager);
                        main();
            })

    }
    else if (response.view == "View the total utilized budget of a department"){
        console.log("prepared to view the total utilized budget of a department");
        main();

    }

    if (response.task == "Update employee information"){
        console.log("prepared to update employee information");

        await inquirer
                .prompt([
                {
                    type: "list",
                    message: "Whose information would you like to update?",
                    name: "updateEmployee",
                    choices: employeeList
                },
                {
                    type: "list",
                    message: "Please select Employees department",
                    name: "updateEmployee_department",
                    choices: departmentList
                },

            ]).then(async (response)=>{
                let roles = await db.query(`SELECT title FROM role INNER JOIN department ON role.department_id = department.id WHERE department.name = '${response.updateEmployee_department}' `);
                Empdept_id = await db.query(`SELECT id FROM department WHERE name = '${response.updateEmployee_department}'`);

                let employee_firstName = response.updateEmployee.split(' ')[0];
                let employee_lastName = response.updateEmployee.split(' ')[1];
                Emp_id = await db.query(`SELECT id from employee WHERE firstName = '${employee_firstName}' AND lastName = '${employee_lastName}'`)
                for (i = 0; i<roles.length; i++){
                roleList.push(roles[i].title);
                }
            


                let managersInDept = await db.query(`SELECT employee.firstName, employee.lastName FROM employee INNER JOIN role ON employee.role_id = role.id WHERE title = "Manager" AND department_id = ${Empdept_id[0].id};`);

    
                for (i = 0; i<managersInDept.length; i++){
                    managerList.unshift(`${managersInDept[i].firstName} ${managersInDept[i].lastName}`);
                    
                }
            })

            await inquirer
            .prompt([
                {
                    type: "list",
                    message: "Please select Manager for Employee from Managers available in selected department or select No Manager",
                    name: "updateEmployee_manager",
                    choices: managerList
                },
                {
                    type: "list",
                    message: "Please select employee role",
                    name: "updateEmployee_role",
                    choices: roleList
                }
            ]).then(async (response)=>{
                let manager_firstName = response.updateEmployee_manager.split(' ')[0];
                let manager_lastName = response.updateEmployee_manager.split(' ')[1];
                let manager_id = await db.query(`SELECT id FROM employee WHERE firstName = '${manager_firstName}' AND lastName = '${manager_lastName}' `);
                

                let role_id = await db.query(`SELECT id FROM role WHERE title = '${response.updateEmployee_role}' AND department_id = ${Empdept_id[0].id}`);
            
                 await db.query(`UPDATE employee SET role_id = ${role_id[0].id}, manager_id = ${manager_id[0].id} WHERE id = ${Emp_id[0].id}`);
                 console.log("Employee record updated");
                 let updateEmployee = await db.query("SELECT * FROM employee");
                 console.table(updateEmployee);
                 main();
            })
        
    }

    if (response.delete == "Delete departments"){

        await inquirer
                .prompt([
                {
                    type: "list",
                    message: "Please select department to delete?",
                    name: "deleteDepartment",
                    choices: departmentList
                },
            ]).then(async (response)=>{
                let dept_id = await db.query(`SELECT id FROM department WHERE name = '${response.deleteDepartment}'`);
                await db.query(`DELETE FROM department WHERE id = ${dept_id[0].id} `);
                let departments = await db.query("SELECT * FROM department");
                console.log("Selected department deleted");
                console.table(departments);
                main();
            })

    }
    else if (response.delete == "Delete roles"){
        console.log("prepared to delete roles");

        await inquirer
        .prompt([
                {
                    type: "list",
                    message: "What department does the role to be deleted belong to",
                    name: "deleteRole_department",
                    choices: departmentList
                }
            ]).then(async (response)=>{
                let roles = await db.query(`SELECT title FROM role INNER JOIN department ON role.department_id = department.id WHERE department.name = '${response.deleteRole_department}' `);
                Empdept_id = await db.query(`SELECT id FROM department WHERE name = '${response.deleteRole_department}'`);
                for (i = 0; i<roles.length; i++){
                roleList.push(roles[i].title);
                }

            })

            await inquirer
            .prompt([
                    
                    {
                        type: "list",
                        message: "Please select role",
                        name: "deleteRole",
                        choices: roleList
                    }
                    
                ]).then(async (response)=>{

                let role_id = await db.query(`SELECT id FROM role WHERE title = '${response.deleteRole}' AND department_id = ${Empdept_id[0].id}`);
                
                 await db.query(`DELETE FROM role WHERE id = ${role_id[0].id} `);
                 console.log("Deleted selected role");
                 let deleteRole = await db.query("SELECT * FROM role");
                 console.table(deleteRole);
                 main();
                })
    }
    else if (response.delete == "Delete employees"){
        console.log("prepared to delete employees");



        await inquirer
                .prompt([
                {
                    type: "list",
                    message: "Which employee would you like to Delete?",
                    name: "deleteEmployee",
                    choices: employeeList
                }
            ]).then(async (response)=>{

                let employee_firstName = response.deleteEmployee.split(' ')[0];
                let employee_lastName = response.deleteEmployee.split(' ')[1];
                Emp_id = await db.query(`SELECT id from employee WHERE firstName = '${employee_firstName}' AND lastName = '${employee_lastName}'`);
                 await db.query(`DELETE FROM employee WHERE id = ${Emp_id[0].id} `);
                 console.log("Deleted selected employee");
                 let deleteEmployee = await db.query("SELECT * FROM employee");
                 console.table(deleteEmployee);
                 main();
                })
}
}

main();

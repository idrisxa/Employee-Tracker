//const fs = require("fs");
//const axios = require("axios");
const inquirer = require("inquirer");
const express = require('express');
//const consoleTable = require('console.table');
//path

const PORT = process.env.PORT || 8080;
const mysql = require('mysql');

const app = express();
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// all our reservations in this
app.use(express.static('public'));

departmentList = [];
roleList = [];

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
  


// let connection = mysql.createConnection({
//   host: "localhost",

//   // Your port; if not 3306
//   port: 3306,

//   // Your username
//   user: "root",

//   // Your password
//   password: "testtest",
//   database: "employeesDB"
// });


//  connection.connect( function(err) {
//   if (err) throw err;
//   console.log("connected as id " + connection.threadId);
//    //connection.end();
//    afterConnection();
// })
async function main(){
    //let result = await db.query( "SELECT * FROM employees" );
    // mytest();
    // var mytest = function(){
    //     return new Promise( function(resolve,reject){
    //         console.log( 'this is a test' );
    //         resolve( "secret result" );
    //     })
    // }
    // let myresult = await mytest;
    // console.log( `myresult=${myresult}` );

    let response = await inquirer
            .prompt([
                    {
                        type: "list",
                        message: "Hello there! What would you like to do?",
                        name: "task",
                        choices:[
                            "Add departments, roles, employees",
                            "View departments, roles, employees",
                            "Update employee roles",
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
                            return input.task == "Update employee roles"
                                        },
                            type: "list",
                            name: "update",
                            message: "What would you like to Update?",
                            choices:[
                                "Update employee role",
                                "Update employee manager",
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
    // now we have the inquirer results:
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
            })
    }
    else if (response.add == "Add roles"){
        console.log("prepared to add roles");
        let departments = await db.query("SELECT name FROM department");
        for (i = 0; i<departments.length; i++){
            departmentList.push(departments[i].name);
        }
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
                //console.log(dept_id[0].id);
                await db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${response.addRole}', ${response.addRole_salary}, ${dept_id[0].id})`);
                console.log("New role added");
                let addRole = await db.query("SELECT * FROM role");
                console.table(addRole);
            });

    }
    else if (response.add == "Add employees"){
        // console.log("prepared to add employees");
        // let departments = await db.query("SELECT name FROM department");
        // for (i = 0; i<departments.length; i++){
        //     departmentList.push(departments[i].name);
        // }
        // let roles = await db.query("SELECT title FROM role");
        // for (i = 0; i<roles.length; i++){
        //     roleList.push(roles[i].title);
        // }
        // inquirer
        // .prompt([
        //         {
        //             type: "list",
        //             message: "Please select department this employee belongs to",
        //             name: "addEmployee_department",
        //             choices: departmentList
        //         },
        //         {
        //             type: "list",
        //             message: "Please select employee role",
        //             name: "addEmployee_role",
        //             choices: roleList
        //         },
        //         {
        //             type: "input",
        //             message: "Please enter employee First Name",
        //             name: "addEmployee_firstName",
        //         },
        //         {
        //             type: "input",
        //             message: "Please enter employee Last Name",
        //             name: "addEmployee_lastName",
        //         }
        //     ]).then(async (response)=>{
        //         let role_id = await db.query(`SELECT id FROM role WHERE title = '${response.addEmployee_role}'`);
        //         let manager_id = await db.query(`SELECT employee.id,
        //         FROM employee
        //         INNER JOIN role 
        //         ON employee.role_id = role.id
        //         WHERE title = "Manager";`);
        //         //console.log(dept_id[0].id);
        //         await db.query(`INSERT INTO employee (firstName, lastName, role_id, manager_id) VALUES ('${response.addEmployee_firstName}', '${response.addEmployee_lastName}', ${role_id[0].id}, ${dept_id[0].id})`);
        //         console.log("New role added");
        //         let addRole = await db.query("SELECT * FROM role");
        //         console.table(addRole);
        //     });
    }

    if (response.view == "View departments"){
        console.log("prepared to view department");
        let departments = await db.query("SELECT * FROM department");
        console.table(departments);
    }
    else if (response.view == "View roles"){
        console.log("prepared to view roles");
        let roles = await db.query("SELECT * FROM role",);
        console.table(roles);
    }
    else if (response.view == "View employees"){
        console.log("prepared to view employees");
       let employees = await db.query("SELECT * FROM employee",);
       console.table(employees);
            
    }
    else if (response.view == "View employees by manager"){
        console.log("prepared to view employees by manager");
    }
    else if (response.view == "View the total utilized budget of a department"){
        console.log("prepared to view the total utilized budget of a department");
    }

    if (response.update == "Update employee role"){
        console.log("prepared to update employee role");
    }
    else if (response.update == "Update employee manager"){
        console.log("prepared to update employee manager");
    }

    if (response.delete == "Delete departments"){
        console.log("prepared to delete department");
    }
    else if (response.delete == "Delete roles"){
        console.log("prepared to delete roles");
    }
    else if (response.delete == "Delete employees"){
        console.log("prepared to delete employees");
    }
}

main();
       // }

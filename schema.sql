DROP DATABASE IF EXISTS employeesDB;
CREATE database employeesDB;
USE employeesDB;

CREATE TABLE department(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30)
)

CREATE TABLE role(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
)

CREATE TABLE employee(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(30),
    lastName VARCHAR(30),
    role_id INT NOT NULL,
    manager_id DECIMAL,
)

INSERT INTO department (name) VALUES ('Human Resources'), ('Supply Chain'), ('Finanace'), ('Legal');
INSERT INTO employee(firstName, lastName,role_id,manager_id) 
VALUES ('Idris', 'Adebisi', 1, 1), ('Josephine', 'Shahab', 2, 1);
INSERT INTO role(title, salary, department_id)
VALUES ('Manager', 10.00, 20), ('Director',12.00,20), ('Intern', 7.00, 20); 
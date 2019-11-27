INSERT INTO department (name) VALUES ('Human Resources'), ('Supply Chain'), ('Finanace'), ('Legal');
INSERT INTO employee(firstName, lastName,role_id,manager_id) 
VALUES ('Idris', 'Adebisi', 1, 1), ('Josephine', 'Shahab', 2, 1);
INSERT INTO role(title, salary, department_id)
VALUES ('Manager', 10.00, 20), ('Director',12.00,20), ('Intern', 7.00, 20); 

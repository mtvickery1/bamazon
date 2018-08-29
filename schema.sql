DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(50),
  department_name VARCHAR(50),
  price INT,
  stock_quantity INT,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Drone", "Electronics", 1200, 50),
("Bag of Candy", "Food", 1, 50),
("Kayak", "Outdoor", 500, 20),
("Bike", "Outdoor", 300, 100),
("Shrek on VHS", "Entertainment", 5, 1000),
("Pack of Bacon", "Food", 7, 80),
("Tank Tops", "Clothing", 10, 500),
("Biscuits and Gravy", "Food", 25, 100),
("Pumpkin", "Seasonal", 10, 200),
("Palm Tree", "Garden", 100, 25);


SELECT * FROM products;

CREATE TABLE departments(
  department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  PRIMARY KEY(department_id)
);

INSERT INTO departments (department_name)
VALUES
 ("Electronics"),
 ("Food"),
 ("Outdoor"),
 ("Entertainment"),
 ("Clothing"),
 ("Seasonal"),
 ("Garden");
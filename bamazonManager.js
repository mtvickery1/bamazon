var inquirer = require("inquirer");
var mysql = require("mysql");
var chalk = require("chalk");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
    displayOptions();
});

var displayOptions = function (res) {
    inquirer.prompt([
        {
            name: "Menu",
            type: "list",
            choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product", "Quit"]
        }
    ])
        .then(function (answer) {
            switch (answer.Menu) {
                case "View Products For Sale":
                    displayTable();
                    break;
                case "View Low Inventory":
                    displayLowInventory();
                    break;
                case "Add To Inventory":
                    addToInventory();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                case "Quit":
                    console.log("BYE!");
                    connection.end();
            };
        })
}

var displayTable = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({ head: ["Item ID", "Product", "Department", "Price", "Quantity"] });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }

        console.log(table.toString());

        displayOptions();
    })
}

var displayLowInventory = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({ head: ["Item ID", "Product", "Department", "Price", "Quantity"] });

        for (var i = 0; i < res.length; i++) {

            if (res[i].stock_quantity <= 10) {

                table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
            }
        }

        console.log(table.toString());

        displayOptions();
    })
}

var addToInventory = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({ head: ["Item ID", "Product", "Department", "Price", "Quantity"] });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }

        console.log(table.toString());

        inquirer.prompt([
            {
                name: "productId",
                type: "input",
                message: "What is the ID of the item you would like to add to?",
            },
            {
                name: "addQuantity",
                type: "input",
                message: "How many would you like to add?"
            }
        ])
            .then(function (answer) {
                var input;
                for (var i = 0; i < res.length; i++) {
                    if (parseInt(answer.productId) === res[i].item_id) {
                        var oldQuantity = res[i].stock_quantity;
                        var addQuantity = parseInt(answer.addQuantity);
                        input = answer;
                        updateQuantity(oldQuantity, addQuantity, input);
                    }
                }
            })
    })
}

var updateQuantity = function (oldQuantity, addQuantity, input) {
    var updatedQuantity = oldQuantity + addQuantity;
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: updatedQuantity
            },
            {
                item_id: input.productId
            }
        ],
        function (err) {
            if (err) throw err;
            connection.query("SELECT * FROM products WHERE item_id=?",
                [
                    input.productId
                ],
                function (err, res) {
                    if (err) throw err;
                    var itemPurchased = res[0].product_name;
                    console.log("Successfully added " + addQuantity + " " + itemPurchased + "(s)");
                    displayOptions();
                }
            )
        }
    )
}

var addNewProduct = function () {

    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;

        var departments = [];
        for (var i = 0; i < res.length; i++) {
            departments.push(res[i].department_name);
        };
        inquirer.prompt([
            {
                name: "newProductName",
                type: "input",
                message: "What is the name of the product you would like to add?",
            },
            {
                name: "department",
                type: "list",
                message: "What department does this product fall into?",
                choices: departments
            },
            {
                name: "price",
                type: "input",
                message: "What is the price?",
            },
            {
                name: "quantity",
                type: "input",
                message: "How many do we have?"
            }
        ])
            .then(function (answer) {
                var name = answer.newProductName;
                var department = answer.department;
                var price = parseInt(answer.price);
                var inventory = parseInt(answer.quantity);
                connection.query("INSERT INTO products SET ?",
                    {
                        product_name: name,
                        department_name: department,
                        price: price,
                        stock_quantity: inventory
                    }, function (err) {
                        if (err) throw err;
                        console.log("Successfully added " + name + "(s) to Bamazon!");
                        displayOptions();
                    })
            })
    })
}
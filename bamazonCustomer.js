var inquirer = require("inquirer");
var mysql = require("mysql");
var chalk = require("chalk");
var Table = require('cli-table');

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
    displayTable();
});

var displayTable = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({ head: ["Item ID", "Product", "Department", "Price", "Quantity"] });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }

        console.log(table.toString());

        startShopping(res);
    })
}

var startShopping = function (res) {
    inquirer.prompt([
        {
            name: "productId",
            type: "input",
            message: "What is the ID of the product that you would like to purchase?",
        },
        {
            name: "quantity",
            type: "input",
            message: "How many would you like?"
        }
    ])
        .then(function (answer) {
            var chosenProduct;
            var input;
            for (var i = 0; i < res.length; i++) {
                if (parseInt(answer.productId) === res[i].item_id && res[i].stock_quantity <= 0) {
                    console.log("Out of stock! Please make another selection.");
                    startShopping(res);
                } else if (parseInt(answer.productId) === res[i].item_id) {
                    chosenProduct = res[i];
                    input = answer;
                    fulfillOrder(chosenProduct, input);
                }
            }
        })
}

var fulfillOrder = function (chosenProduct, input) {
    var newQuantity = chosenProduct.stock_quantity - input.quantity;
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newQuantity
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
                    var total = input.quantity * res[0].price;
                    var quantityPurchased = input.quantity;
                    var itemPurchased = res[0].product_name;
                    console.log("You purchased " + quantityPurchased + " " + itemPurchased + "(s) for a total of $" + total + ".");
                    wannaBuyMore();
                }
            )
        }
    )
}

var wannaBuyMore = function () {
    inquirer.prompt([
        {
            name: "buyMore",
            type: "confirm",
            message: "Would you like to purchase anything else?",
        }
    ]).then(function (input) {
        if (input.buyMore) {
            displayTable()
        } else {
            console.log("BYE!");
            connection.end();
        }
    })
}
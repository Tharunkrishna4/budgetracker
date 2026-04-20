let transactions = [];
let currentType = "income";
let editId = null;

// CATEGORY DATA
const incomeCategories = ["Salary", "Freelance", "Other"];
const expenseCategories = ["Rent", "Shopping", "Food", "Travel"];

// SET TYPE
function setType(type) {
    currentType = type;
    updateCategories();
}

// UPDATE CATEGORY DROPDOWN
function updateCategories() {
    const category = document.getElementById("category");
    category.innerHTML = "";

    let list = currentType === "income" ? incomeCategories : expenseCategories;

    list.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.text = cat;
        category.appendChild(option);
    });
}

// ADD / EDIT TRANSACTION
function addTransaction() {
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;

    if (!amount || description === "" || date === "") {
        alert("Please fill all fields");
        return;
    }

    if (editId) {
        // UPDATE
        transactions = transactions.map(t => {
            if (t.id === editId) {
                return {
                    ...t,
                    amount,
                    category,
                    description,
                    date,
                    type: currentType
                };
            }
            return t;
        });

        editId = null;
        document.getElementById("confirmMsg").innerText = "Transaction Updated!";
    } else {
        // ADD
        const transaction = {
            id: Date.now(),
            type: currentType,
            amount,
            category,
            description,
            date
        };

        transactions.push(transaction);
        document.getElementById("confirmMsg").innerText = "Transaction Added!";
    }

    saveTransactions();
    renderTransactions();
    calculateBalance();

    // CLEAR INPUTS
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    document.getElementById("date").value = "";
}

// DELETE
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);

    saveTransactions();
    renderTransactions();
    calculateBalance();
}

// EDIT
function editTransaction(id) {
    const t = transactions.find(t => t.id === id);

    document.getElementById("amount").value = t.amount;
    document.getElementById("description").value = t.description;
    document.getElementById("date").value = t.date;

    currentType = t.type;
    updateCategories();
    document.getElementById("category").value = t.category;

    editId = id;
}

// RENDER
function renderTransactions() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    transactions.forEach(t => {
        const card = document.createElement("div");

        card.style.background = t.type === "income" ? "green" : "red";
        card.style.color = "white";
        card.style.margin = "10px";
        card.style.padding = "10px";

        card.innerHTML = `
            <div>₹${t.amount}</div>
            <div>${t.category}</div>
            <div>${t.description}</div>
            <div>${t.date}</div>
            <button onclick="editTransaction(${t.id})">Edit</button>
            <button onclick="deleteTransaction(${t.id})">Delete</button>
        `;

        list.appendChild(card);
    });
}

// BALANCE
function calculateBalance() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === "income") {
            income += t.amount;
        } else {
            expense += t.amount;
        }
    });

    let balance = income - expense;

    document.getElementById("income").innerText = "Income: ₹" + income;
    document.getElementById("expense").innerText = "Expense: ₹" + expense;
    document.getElementById("balance").innerText = "Balance: ₹" + balance;
}

// STORAGE
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
    const data = localStorage.getItem("transactions");
    if (data) {
        transactions = JSON.parse(data);
    }
}

// ON LOAD
window.onload = function () {
    loadTransactions();
    updateCategories();
    renderTransactions();
    calculateBalance();
};
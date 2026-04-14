let transactions = [];
let currentType = "income";

// ===== SET TYPE =====
function setType(type) {
    currentType = type;
    updateCategories();
}

// ===== UPDATE CATEGORY =====
function updateCategories() {
    const category = document.getElementById("category");
    category.innerHTML = "";

    let options = [];

    if (currentType === "income") {
        options = ["Salary", "Freelance", "Other"];
    } else {
        options = ["Rent", "Shopping", "Transport", "Entertainment", "Other"];
    }

    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.innerText = opt;
        category.appendChild(option);
    });
}

// ===== ADD TRANSACTION =====
function addTransaction() {
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const desc = document.getElementById("desc").value;
    const date = document.getElementById("date").value;

    if (!amount || !desc || !date) {
        alert("Fill all fields");
        return;
    }

    const transaction = {
        id: Date.now(),
        type: currentType,
        amount: amount,
        category: category,
        description: desc,
        date: date
    };

    transactions.push(transaction);

    saveTransactions();
    renderTransactions();

    document.getElementById("msg").innerText = "Transaction Added!";

    // Clear fields
    document.getElementById("amount").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("date").value = "";
}

// ===== SAVE TO LOCALSTORAGE =====
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===== LOAD FROM LOCALSTORAGE =====
function loadTransactions() {
    const data = localStorage.getItem("transactions");
    if (data) {
        transactions = JSON.parse(data);
    }
}

// ===== RENDER =====
function renderTransactions() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    let total = 0;

    transactions.forEach(t => {
        const li = document.createElement("li");

        li.innerText =
            t.type + " | " +
            t.category + " | " +
            t.description + " | ₹" +
            t.amount + " | " +
            t.date;

        list.appendChild(li);

        if (t.type === "income") {
            total += t.amount;
        } else {
            total -= t.amount;
        }
    });

    document.getElementById("total").innerText = "Total: ₹" + total;
}

// ===== RUN ON LOAD =====
window.onload = function () {
    loadTransactions();
    updateCategories();
    renderTransactions();
};
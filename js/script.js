let type = "income";
let transactions = [];
let chart;
const incomeCategories = ["Salary","Freelance","Business","Other"];
const expenseCategories = ["Food","Rent","Transport","Shopping","Other"];


/* Set type */
function setType(t) {
    type = t;

    const incomeBtn = document.getElementById("incomeBtn");
    const expenseBtn = document.getElementById("expenseBtn");

    if (t === "income") {
        incomeBtn.classList.add("active");
        expenseBtn.classList.remove("active");
    } else {
        expenseBtn.classList.add("active");
        incomeBtn.classList.remove("active");
    }

    loadCategories();
}

function loadCategories() {
    const category = document.getElementById("category");
    category.innerHTML = "";

    let selected;

    if (type === "income") {
        selected = incomeCategories;
    } else {
        selected = expenseCategories;
    }

    selected.forEach(function(cat) {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        category.appendChild(option);
    });
}

/* Add transaction */
document.getElementById("addBtn").addEventListener("click", () => {

  const amount = parseFloat(document.getElementById("amount").value);
  const desc = document.getElementById("desc").value.trim();
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;

  if (!amount || desc === "" || date === "") {
    alert("Fill all fields");
    return;
  }

  transactions.push({
    id: Date.now(),
    type,
    amount,
    desc,
    date,
    category
  });

  updateUI();
  updateChart();

  // Clear inputs
  document.getElementById("amount").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("date").value = "";
});

/* Update UI */
function updateUI() {
  let income = 0, expense = 0;

  const list = document.getElementById("list");
  list.innerHTML = "";

  transactions.forEach(t => {

    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const div = document.createElement("div");
    div.className = "transaction-card";

  div.innerHTML = `
  <div class="transaction-row">
    <div class="left">
      <b>${t.type.toUpperCase()}</b>
      <p>${t.category} - ${t.desc}</p>
      <small>${t.date}</small>
    </div>
    <div class="right">
      ₹${t.amount}
    </div>
    <button class="delete-btn"
  onclick="deleteTransaction(${t.id})">✖</button>
     
  </div>
`;

    list.appendChild(div);
  });

  document.getElementById("income").innerText = income;
  document.getElementById("expense").innerText = expense;
  document.getElementById("balance").innerText = income - expense;
}

/* Delete */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateUI();
  updateChart();
}

/* Chart */
function updateChart() {
  const data = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      data[t.category] = (data[t.category] || 0) + t.amount;
    }
  });

  const labels = Object.keys(data);
  const values = Object.values(data);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"]
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}
window.onload = function (){
  loadCategories();
};
let type = "income";
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingId = null;
let chart;

const incomeCategories = ["Salary","Freelance","Business","Other"];
const expenseCategories = ["Food","Rent","Shopping","Transport","Entertainment","Other"];

/* ================= TYPE ================= */
function setType(t){
    type = t;

    loadCategories();

    const incomeBtn = document.getElementById("incomeBtn");
    const expenseBtn = document.getElementById("expenseBtn");
    const addBtn = document.getElementById("addBtn");

    if(type === "income"){
        incomeBtn.classList.add("active");
        expenseBtn.classList.remove("active");

        addBtn.style.background = "#2e7d32"; // green
    } else {
        expenseBtn.classList.add("active");
        incomeBtn.classList.remove("active");

        addBtn.style.background = "#c62828"; // red
    }
}

/* ================= CATEGORY ================= */
function loadCategories(){
  const select = document.getElementById("category");
  select.innerHTML = "";

  const cats = type === "income" ? incomeCategories : expenseCategories;

  cats.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

/* ================= CLEAR FORM (FIXED) ================= */
function clearForm(){
  const amount = document.getElementById("amount");
  const desc = document.getElementById("desc");
  const date = document.getElementById("date");
  const category = document.getElementById("category");

  amount.value = "";
  desc.value = "";
  date.value = "";
  category.selectedIndex = 0;

  // force UI refresh (important fix)
  amount.blur();
  desc.blur();
  date.blur();

  setTimeout(()=>{
    amount.focus();
  }, 50);
}

/* ================= ADD ================= */
document.getElementById("addBtn").addEventListener("click", ()=>{

  const amountEl = document.getElementById("amount");
  const descEl = document.getElementById("desc");
  const dateEl = document.getElementById("date");
  const categoryEl = document.getElementById("category");

  const amount = Number(amountEl.value);
  const desc = descEl.value.trim();
  const date = dateEl.value;
  const category = categoryEl.value;

  // ✅ validation
  if(!amount || !desc || !date){
    alert("Please fill all fields");
    return;
  }

  if(editingId){
    transactions = transactions.map(t =>
      t.id === editingId
        ? { ...t, type, amount, desc, date, category }
        : t
    );
    editingId = null;
    document.getElementById("addBtn").innerText = "Add";
  } else {
    transactions.push({
      id: Date.now(),
      type,
      amount,
      desc,
      date,
      category
    });
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));

  // ✅ CLEAR FIRST (important change)
  clearForm();

  // then update UI
  updateUI();
  updateChart();
  renderMonthlySummary();
  updateGoalUI();
  document.getElementById("transactionsSection")
   .scrollIntoView({behavior:"smooth"});
});

/* ================= DELETE ================= */
function deleteTransaction(id){
  transactions = transactions.filter(t => t.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateUI();
  updateChart();
  renderMonthlySummary();
  updateGoalUI();
}

/* ================= EDIT ================= */
function editTransaction(id){
  const t = transactions.find(x => x.id === id);

  document.getElementById("amount").value = t.amount;
  document.getElementById("desc").value = t.desc;
  document.getElementById("date").value = t.date;

  type = t.type;
  loadCategories();
  document.getElementById("category").value = t.category;

  setType(type);

  editingId = id;
  document.getElementById("addBtn").innerText = "Update";

  document.getElementById("formSection")
   .scrollIntoView({behavior:"smooth"});
}

/* ================= FILTER LOAD ================= */
function loadFilters(){

  const monthSelect = document.getElementById("filterMonth");
  const catSelect = document.getElementById("filterCategory");

  const selectedMonth = monthSelect.value;
  const selectedCat = catSelect.value;

  const months = [...new Set(transactions.map(t => t.date.slice(0,7)))];

  monthSelect.innerHTML = `<option value="all">All Months</option>`;
  months.forEach(m=>{
    monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });

  monthSelect.value = selectedMonth || "all";

  const cats = [...new Set(transactions.map(t => t.category))];

  catSelect.innerHTML = `<option value="all">All Categories</option>`;
  cats.forEach(c=>{
    catSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });

  catSelect.value = selectedCat || "all";
}

/* ================= UI ================= */
function updateUI(){

  loadFilters();

  const list = document.getElementById("list");
  list.innerHTML = "";

  const month = document.getElementById("filterMonth").value;
  const ftype = document.getElementById("filterType").value;
  const fcat = document.getElementById("filterCategory").value;

  let filtered = transactions.filter(t=>{
    return (
      (month === "all" || t.date.slice(0,7) === month) &&
      (ftype === "all" || t.type === ftype) &&
      (fcat === "all" || t.category === fcat)
    );
  });

  if(filtered.length === 0){
  list.innerHTML = `
    <div class="empty-state">
      📭 No transactions yet <br>
      <small>Start by adding income or expense</small>
    </div>
  `;
  return;
}

  let income = 0, expense = 0;

  filtered.forEach(t=>{

    if(t.type==="income") income += t.amount;
    else expense += t.amount;

    const div = document.createElement("div");
    div.className = "transaction " + t.type;

    div.innerHTML = `
      <div class="details">
        <div class="title">${t.category} - ${t.desc}</div>
        <div class="date">${t.date}</div>
        <div class="amount">
          ${t.type === "income" ? "Income" : "Expense"}: ₹${t.amount}
        </div>
      </div>

      <div class="right">
        <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });

  document.getElementById("income").innerText = "Income: ₹" + income;
  document.getElementById("expense").innerText = "Expense: ₹" + expense;
  document.getElementById("balance").innerText = "Balance: ₹" + (income - expense);
}

function updateChart(){

  const chartEmpty = document.getElementById("chartEmpty");
  const chartCanvas = document.getElementById("expenseChart");

  // ✅ get transactions
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // ✅ filter expenses
  const expenses = transactions.filter(t => t.type === "expense");

  // ❌ no data
  if(expenses.length === 0){
    chartCanvas.style.display = "none";
    chartEmpty.style.display = "block";
    return;
  }

  // ✅ show chart
  chartCanvas.style.display = "block";
  chartEmpty.style.display = "none";

  // group by category
  const categoryTotals = {};

  expenses.forEach(t => {
    if(!categoryTotals[t.category]){
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // destroy old chart
  if(window.expenseChartInstance){
    window.expenseChartInstance.destroy();
  }

  const ctx = chartCanvas.getContext("2d");

  window.expenseChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data
      }]
    }
  });
}

/* ================= MONTHLY ================= */
function renderMonthlySummary(){

  const container = document.getElementById("monthlyList");
  container.innerHTML = "";

  let data = {};

  transactions.forEach(t=>{
    let m = t.date.slice(0,7);

    if(!data[m]){
      data[m] = {income:0, expense:0};
    }

    if(t.type==="income") data[m].income += t.amount;
    else data[m].expense += t.amount;
  });

  for(let m in data){

    let d = data[m];
    let net = d.income - d.expense;

    let className = net < 0 ? "month-loss" : "month-profit";

    container.innerHTML += `
      <div class="card ${className}">
        <b>${m}</b><br>
        Income: ₹${d.income} | Expense: ₹${d.expense} | Net: ₹${net}
      </div>
    `;
  }
}

function getBalance(){
  let income = 0, expense = 0;

  transactions.forEach(t=>{
    if(t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  return income - expense;
}

function formatMoney(num){
  return num.toLocaleString("en-IN");
}

function showToast(message, type="success"){
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.className = "show " + (type === "error" ? "toast-error" : "toast-success");

  setTimeout(()=>{
    toast.className = "";
  }, 2500);
}
// ================= GOAL: SAVE =================
function saveGoal(){

  const name = document.getElementById("goalName").value.trim();
  const amount = Number(document.getElementById("goalAmount").value);

  if(!name || !amount || amount <= 0){
    alert("Enter valid goal details");
    return;
  }

  const balance = getBalance();

  const goal = {
    name,
    amount,
    saved: 0
  };

  // 🔴 If goal > balance → show warning but STILL allow goal
  if(amount > balance){
    alert("⚠️ Goal cannot be achieved with current balance");
  }

  // ✅ Save goal
  localStorage.setItem("goal", JSON.stringify(goal));

  // Clear inputs
  document.getElementById("goalName").value = "";
  document.getElementById("goalAmount").value = "";

  // Update UI
  updateGoalUI();
}


// ================= ADD TO GOAL =================
function addToGoal(){

  const goal = JSON.parse(localStorage.getItem("goal"));
  if(!goal) return;

  const addAmount = Number(document.getElementById("goalAddAmount").value);
  const goalDate = document.getElementById("goalDate").value;

  if(!addAmount || addAmount <= 0){
    alert("Enter valid amount");
    return;
  }

  if(!goalDate){
    alert("Select a date");
    return;
  }

  const balance = getBalance();

  // ❌ Only block if add amount > balance
  if(addAmount > balance){
    alert("Not enough balance");
    return;
  }

  // ✅ Add money to goal
  goal.saved += addAmount;

  // ✅ Save updated goal
  localStorage.setItem("goal", JSON.stringify(goal));

  // 🎉 If completed
  if(goal.saved >= goal.amount){

    transactions.push({
      id: Date.now(),
      type: "expense",
      amount: goal.amount,
      desc: "Goal Achieved: " + goal.name,
      date: goalDate,
      category: "Goal"
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    showToast("🎉 Goal completed!","Success");


  }

  // Clear input
  document.getElementById("goalAddAmount").value = "";

  // Refresh UI
  updateUI();
  updateChart();
  renderMonthlySummary();
  updateGoalUI();
}


// ================= DELETE GOAL =================
function deleteGoal(){
  localStorage.removeItem("goal");
  updateGoalUI();
}


// ================= UPDATE UI =================
function updateGoalUI(){

  const goal = JSON.parse(localStorage.getItem("goal"));

  const display = document.getElementById("goalDisplay");
  const status = document.getElementById("goalStatus");
  const progress = document.getElementById("progressFill");
  const addSection = document.querySelector(".goal-add");

  if(!goal){
    display.innerHTML = "No goal set";
    status.innerHTML = "";
    progress.style.width = "0%";
    addSection.style.display = "none";
    return;
  }

  const balance = getBalance();
  const percent = Math.min((goal.saved / goal.amount) * 100, 100);

  display.innerHTML = `<b>${goal.name}</b> - ₹${goal.amount}`;
  progress.style.width = percent + "%";

  // ⚠️ LOW BALANCE WARNING (NOT BLOCKING)
  if(balance < goal.amount){
    status.innerHTML =
      `⚠️ Low Balance! Goal may not be achievable <br>
       💰 Saved: ₹${goal.saved} <br>
       🎯 Goal: ₹${goal.amount} <br>
       💸 Remaining: ₹${goal.amount - goal.saved}`;

    addSection.style.display = "flex"; // allow adding
    return;
  }

  // 🎉 GOAL COMPLETED
  

  // 🟢 NORMAL STATE
  else{
    status.innerHTML =
      `💰 Saved: ₹${goal.saved} <br>
       🎯 Goal: ₹${goal.amount} <br>
       💸 Remaining: ₹${goal.amount - goal.saved}`;

    addSection.style.display = "flex";
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

function exportCSV(){

  if(transactions.length === 0){
    showToast("No data to export", "error");
    return;
  }

  // Header
  let csv = "Type,Amount,Category,Description,Date\n";

  // Rows
  transactions.forEach(t=>{
    csv += `${t.type},${t.amount},${t.category},${t.desc},${t.date}\n`;
  });

  // Create file
  const blob = new Blob([csv], { type: "text/csv" });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "budget_data.csv";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);

  showToast("CSV Downloaded ✅");
}

/* ================= FILTER EVENTS ================= */
document.getElementById("filterMonth").addEventListener("change", updateUI);
document.getElementById("filterType").addEventListener("change", updateUI);
document.getElementById("filterCategory").addEventListener("change", updateUI);

/* ================= INIT ================= */
window.onload = ()=>{
  loadCategories();
  setType("income");
  updateUI();
  updateChart();
  renderMonthlySummary();
  updateGoalUI();
};

document.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    document.getElementById("addBtn").click();
  }
});
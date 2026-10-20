
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const filterInput = document.getElementById("filter");

const list = document.getElementById("transaction-list");
const emptyMessage = document.getElementById("empty-message");
const message = document.getElementById("message");

let transactions = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("student-expenses") || "[]"
  );

  if (Array.isArray(saved)) {
    transactions = saved.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.description === "string" &&
      typeof item.amount === "number" &&
      Number.isFinite(item.amount) &&
      item.amount > 0 &&
      ["income", "expense"].includes(item.type) &&
      typeof item.category === "string" &&
      typeof item.date === "string"
    );
  }
} catch {
  transactions = [];
}

function money(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);
}

function saveTransactions() {
  try {
    localStorage.setItem(
      "student-expenses",
      JSON.stringify(transactions)
    );
    return true;
  } catch {
    message.textContent =
      "Could not save data. Check browser storage.";
    return false;
  }
}

function render() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById("income").textContent = money(income);
  document.getElementById("expense").textContent = money(expense);
  document.getElementById("balance").textContent =
    money(income - expense);

  list.replaceChildren();

  const filter = filterInput.value;
  const visible = transactions.filter(item =>
    filter === "all" || item.type === filter
  );

  emptyMessage.hidden = visible.length > 0;

  visible.forEach(item => {
    const li = document.createElement("li");
    li.className = "transaction";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("strong");
    title.textContent = item.description;

    const details = document.createElement("small");
    details.textContent = `${item.category} · ${item.date}`;

    info.append(title, details);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("span");
    amount.className = item.type === "income"
      ? "amount positive"
      : "amount negative";

    amount.textContent =
      `${item.type === "income" ? "+" : "−"}${money(item.amount)}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.setAttribute(
      "aria-label",
      `Delete transaction ${item.description}`
    );

    remove.addEventListener("click", () => {
      const previous = transactions;
      transactions = transactions.filter(
        transaction => transaction.id !== item.id
      );

      if (!saveTransactions()) {
        transactions = previous;
      }

      render();
    });

    right.append(amount, remove);
    li.append(info, right);
    list.append(li);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  message.textContent = "";

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    message.textContent = "Enter a valid description and amount.";
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value,
    date: new Date().toLocaleDateString("en-IN")
  };

  transactions.unshift(transaction);

  if (!saveTransactions()) {
    transactions.shift();
    return;
  }

  form.reset();
  message.textContent = "Transaction added successfully!";
  render();
});

filterInput.addEventListener("change", render);

render();

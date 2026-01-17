const expenseList = document.getElementById("expenseList");

function scanReceipt() {
  const file = document.getElementById("receiptImage").files[0];
  if (!file) {
    alert("Chọn ảnh hóa đơn");
    return;
  }

  Tesseract.recognize(
    file,
    'jpn',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);
    autoFill(text);
  });
}

function autoFill(text) {
  // Tìm số tiền ¥
  const amountMatch = text.match(/¥?\s?([0-9,]{3,})/);
  if (amountMatch) {
    document.getElementById("amount").value =
      amountMatch[1].replace(/,/g, '');
  }

  // Ngày hôm nay
  document.getElementById("date").value =
    new Date().toISOString().split("T")[0];

  // Tên shop (dòng đầu tiên)
  const firstLine = text.split("\n")[0];
  document.getElementById("shop").value = firstLine;
}

function saveExpense() {
  const data = {
    date: date.value,
    shop: shop.value,
    amount: amount.value
  };

  const list = JSON.parse(localStorage.getItem("expenses") || "[]");
  list.push(data);
  localStorage.setItem("expenses", JSON.stringify(list));
  renderList();
}

function renderList() {
  const list = JSON.parse(localStorage.getItem("expenses") || "[]");
  expenseList.innerHTML = "";
  list.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date} | ${e.shop} | ¥${e.amount}`;
    expenseList.appendChild(li);
  });
}

renderList();

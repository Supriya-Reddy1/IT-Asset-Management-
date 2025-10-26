const assetForm = document.getElementById("assetForm");
const tableBody = document.querySelector("#assetTable tbody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");
const chartsBtn = document.getElementById("chartsBtn");
const chartsSection = document.getElementById("chartsSection");

let assets = JSON.parse(localStorage.getItem("assets")) || [];
let editIndex = -1;
let statusChart = null;
let typeChart = null;

// ===== TOGGLE CHARTS =====
chartsBtn.addEventListener("click", () => {
  chartsSection.style.display = chartsSection.style.display === "flex" ? "none" : "flex";
  updateCharts();
});

// ===== RENDER TABLE =====
function renderTable() {
  tableBody.innerHTML = "";
  assets.forEach((asset, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${asset.type}</td>
      <td>${asset.name}</td>
      <td>${asset.status}</td>
      <td>${asset.assignedTo || "-"}</td>
      <td>${asset.purchaseDate}</td>
      <td>
        <button onclick="editAsset(${index})">Edit</button>
        <button onclick="deleteAsset(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  localStorage.setItem("assets", JSON.stringify(assets));
}

// ===== ADD / EDIT ASSET =====
assetForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newAsset = {
    type: document.getElementById("assetType").value,
    name: document.getElementById("assetName").value,
    status: document.getElementById("assetStatus").value,
    assignedTo: document.getElementById("assignedTo").value,
    purchaseDate: document.getElementById("purchaseDate").value,
  };

  if (editIndex === -1) {
    assets.push(newAsset);
  } else {
    assets[editIndex] = newAsset;
    editIndex = -1;
    document.getElementById("submitBtn").innerText = "Add Asset";
  }

  assetForm.reset();
  renderTable();
  updateCharts();
});

// ===== EDIT ASSET =====
function editAsset(index) {
  const asset = assets[index];
  document.getElementById("assetType").value = asset.type;
  document.getElementById("assetName").value = asset.name;
  document.getElementById("assetStatus").value = asset.status;
  document.getElementById("assignedTo").value = asset.assignedTo;
  document.getElementById("purchaseDate").value = asset.purchaseDate;
  editIndex = index;
  document.getElementById("submitBtn").innerText = "Update Asset";
}

// ===== DELETE ASSET =====
function deleteAsset(index) {
  if (confirm("Are you sure you want to delete this asset?")) {
    assets.splice(index, 1);
    renderTable();
    updateCharts();
  }
}

// ===== SEARCH FEATURE =====
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  Array.from(tableBody.rows).forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
});

// ===== EXPORT CSV =====
exportBtn.addEventListener("click", () => {
  let csv = "Type,Name,Status,Assigned To,Purchase Date\n";
  assets.forEach(a => {
    csv += `${a.type},${a.name},${a.status},${a.assignedTo || "-"},${a.purchaseDate}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "assets.csv";
  a.click();
});

// ===== CHARTS =====
function updateCharts() {
  const ctxStatus = document.getElementById("statusChart").getContext("2d");
  const ctxType = document.getElementById("typeChart").getContext("2d");

  const statusCounts = ["Available", "In Use", "In Repair", "Retired"].map(s =>
    assets.filter(a => a.status === s).length
  );

  const typeCounts = ["Laptop", "Desktop", "Server", "Network Device", "Software License"].map(t =>
    assets.filter(a => a.type === t).length
  );

  if (statusChart) statusChart.destroy();
  if (typeChart) typeChart.destroy();

  statusChart = new Chart(ctxStatus, {
    type: "doughnut",
    data: {
      labels: ["Available", "In Use", "In Repair", "Retired"],
      datasets: [{
        data: statusCounts,
        backgroundColor: ["#27ae60", "#2980b9", "#f39c12", "#c0392b"],
      }],
    },
    options: {
      plugins: { legend: { position: "bottom" }, title: { display: true, text: "Asset Status Overview" } },
      cutout: "60%",
      responsive: true,
    },
  });

  typeChart = new Chart(ctxType, {
    type: "doughnut",
    data: {
      labels: ["Laptop", "Desktop", "Server", "Network Device", "Software License"],
      datasets: [{
        data: typeCounts,
        backgroundColor: ["#3498db", "#9b59b6", "#e67e22", "#1abc9c", "#f1c40f"],
      }],
    },
    options: {
      plugins: { legend: { position: "bottom" }, title: { display: true, text: "Asset Type Overview" } },
      cutout: "60%",
      responsive: true,
    },
  });
}

// ===== INITIALIZE =====
renderTable();

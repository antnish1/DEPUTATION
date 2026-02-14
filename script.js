const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

let currentCallbackName = null;

/* ===============================
   LOAD BRANCH
================================= */
function loadBranch(branch) {
  document.getElementById("branchTitle").innerText = branch;
  document.getElementById("saveAllBtn").style.display = "inline-block";

  currentCallbackName = "handleEngineers_" + Date.now();

  window[currentCallbackName] = function (engineers) {
    renderEngineers(branch, engineers);
    loadTodayData(branch);
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?action=getEngineers" +
    "&location=" + encodeURIComponent(branch) +
    "&callback=" + currentCallbackName;

  document.body.appendChild(script);
}


/* ===============================
   LOAD TODAY DATA
================================= */
function loadTodayData(branch) {

  const callbackName = "handleToday_" + Date.now();

  window[callbackName] = function (data) {

    data.forEach(entry => {

      const rows = document.querySelectorAll("#tableBody tr");

      rows.forEach((row, index) => {

        const engineer = row.getAttribute("data-engineer");

        if (engineer === entry.engineerName) {

          document.getElementById(`wo_${index}`).value = entry.workshopOnsite || "";
          document.getElementById(`call_${index}`).value = entry.callType || "";
          document.getElementById(`ps_${index}`).value = entry.primarySecondary || "";
          document.getElementById(`complaint_${index}`).value = entry.complaint || "";
          document.getElementById(`customer_${index}`).value = entry.customerName || "";
          document.getElementById(`machine_${index}`).value = entry.machineNo || "";
          document.getElementById(`hmr_${index}`).value = entry.hmr || "";
          document.getElementById(`status_${index}`).value = entry.breakdownStatus || "";
          document.getElementById(`callid_${index}`).value = entry.callId || "";
          document.getElementById(`labour_${index}`).value = entry.labourCharge || "";
          document.getElementById(`km_${index}`).value = entry.siteDistance || "";
          document.getElementById(`total_${index}`).value = entry.totalAllowances || "";

          row.style.border = "2px solid green";
        }

      });

    });

  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?action=getTodayData" +
    "&location=" + encodeURIComponent(branch) +
    "&callback=" + callbackName;

  document.body.appendChild(script);
}


/* ===============================
   RENDER ENGINEERS (TABLE MODE)
================================= */
function renderEngineers(branch, engineers) {

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  engineers.forEach((engineer, index) => {

    const row = document.createElement("tr");
    row.setAttribute("data-engineer", engineer);

    row.innerHTML = `
      <td>${engineer}</td>

      <td>
        <select id="wo_${index}">
          <option value=""></option>
          <option>Workshop</option>
          <option>Onsite</option>
          <option>Free</option>
        </select>
      </td>

      <td>
        <select id="call_${index}">
          <option value=""></option>
          <option>U/W</option>
          <option>B/W</option>
          <option>P/T</option>
          <option>P/W</option>
          <option>JCB CARE</option>
          <option>ASC</option>
          <option>Goodwill</option>
        </select>
      </td>

      <td>
        <select id="ps_${index}">
          <option value=""></option>
          <option>Primary</option>
          <option>Secondary</option>
        </select>
      </td>

      <td><input id="complaint_${index}"></td>
      <td><input id="customer_${index}"></td>
      <td><input id="machine_${index}"></td>
      <td><input id="hmr_${index}"></td>

      <td>
        <select id="status_${index}">
          <option value=""></option>
          <option>Running With Problem</option>
          <option>Breakdown</option>
          <option>PDI</option>
          <option>Service</option>
          <option>Installation</option>
          <option>Visit</option>
        </select>
      </td>

      <td><input id="callid_${index}"></td>
      <td><input id="labour_${index}"></td>
      <td><input id="km_${index}"></td>
      <td><input id="total_${index}" readonly></td>
    `;

    tbody.appendChild(row);
  });
}


/* ===============================
   SAVE ALL ENGINEERS
================================= */
async function saveAll() {

  const saveBtn = document.getElementById("saveAllBtn");
  const rows = document.querySelectorAll("#tableBody tr");

  if (!rows.length) {
    alert("No engineers loaded ❗");
    return;
  }

  const branch = document.getElementById("branchTitle").innerText;

  saveBtn.disabled = true;
  saveBtn.innerText = "Saving... ⏳";

  let savePromises = [];
  let skippedCount = 0;

  rows.forEach((row, index) => {

    row.classList.remove("missing");

    const engineer = row.getAttribute("data-engineer");
    const machineNo = document.getElementById(`machine_${index}`).value.trim();

    if (!machineNo) {
      skippedCount++;
      row.classList.add("missing");
      return;
    }

    const payload = {
      officeLocation: branch,
      engineerName: engineer,
      workshopOnsite: document.getElementById(`wo_${index}`).value,
      callType: document.getElementById(`call_${index}`).value,
      primarySecondary: document.getElementById(`ps_${index}`).value,
      complaint: document.getElementById(`complaint_${index}`).value,
      customerName: document.getElementById(`customer_${index}`).value,
      contactNumber: "", // kept for backend compatibility
      machineNo: machineNo,
      hmr: document.getElementById(`hmr_${index}`).value,
      breakdownStatus: document.getElementById(`status_${index}`).value,
      siteLocation: "", // kept for backend compatibility
      callId: document.getElementById(`callid_${index}`).value,
      labourCharge: document.getElementById(`labour_${index}`).value,
      siteDistance: document.getElementById(`km_${index}`).value,
      totalAllowances: document.getElementById(`total_${index}`).value
    };

    const request = fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(response => ({ response, row }));

    savePromises.push(request);
  });

  if (!savePromises.length) {
    alert("No valid entries to save ❗");
    saveBtn.disabled = false;
    saveBtn.innerText = "💾 Save All Engineers";
    return;
  }

  try {

    const results = await Promise.all(savePromises);

    let successCount = 0;
    let duplicateCount = 0;

    results.forEach(({ response, row }) => {

      if (response.status === "success") {
        successCount++;
        row.style.opacity = "0.6";
      }

      else if (response.status === "updated") {
        successCount++;
        row.style.border = "2px solid orange";
      }

      else if (response.status === "duplicate") {
        duplicateCount++;
        row.style.border = "2px solid red";
      }

    });

    showSummaryPopup(successCount, duplicateCount, skippedCount);

  } catch (error) {
    console.error("Save error:", error);
    alert("Unexpected error occurred ❗");
  }

  saveBtn.disabled = false;
  saveBtn.innerText = "💾 Save All Engineers";
}


/* ===============================
   POPUP FUNCTIONS
================================= */
function showDuplicatePopup(engineer, machine) {
  document.getElementById("popupText").innerText =
    `${engineer} has already been deputed for ${machine} today`;

  document.getElementById("popup").classList.remove("hidden");
}

function showSummaryPopup(saved, duplicates, skipped) {
  document.getElementById("popupText").innerText =
    `Saved: ${saved}\n` +
    `Duplicates: ${duplicates}\n` +
    `Incomplete: ${skipped}`;

  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

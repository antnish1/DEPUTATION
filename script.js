const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

const NON_DEPUTATION_WORK_TYPES = ["Free", "Leave", "Absent"];


/* ===============================
   GLOBAL LOADER CONTROL
================================= */

function showLoader(message = "Loading...") {
  const loader = document.getElementById("globalLoader");
  const text = document.getElementById("loaderText");

  text.innerText = message;
  loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  loader.classList.add("hidden");
}


function jsonpRequest(params, callback) {

  const callbackName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  window[callbackName] = (payload) => {
    callback(payload);
    delete window[callbackName];
    script.remove();
  };

  const query = new URLSearchParams({ ...params, callback: callbackName }).toString();
  const script = document.createElement("script");
  script.src = `${API_URL}?${query}`;

  script.onerror = () => {
    delete window[callbackName];
    script.remove();
    alert("Unable to load data from server ❗");
  };

  document.body.appendChild(script);
}
/* ===============================
   LOAD BRANCH
================================= */
function loadBranch(branch) {

  showLoader("Loading branch data...");
  document.getElementById("saveAllBtn").disabled = false;
  // Show hidden content
  document.getElementById("branchContent").style.display = "block";
  

  document.getElementById("branchHiddenTitle").innerText = branch;

  const menuLabel = document.getElementById("deputationMenuLabel");
  menuLabel.innerText = `Deputation >> ${branch} ▾`;

  jsonpRequest({ action: "getEngineers", location: branch }, (engineers = []) => {

    renderEngineers(engineers);

    jsonpRequest({ action: "getTodayData", location: branch }, (data = []) => {

      populateTodayData(data);

      hideLoader();
    });

  });
}
/* ===============================
   LOAD TODAY DATA
================================= */
function populateTodayData(data) {

  const rows = document.querySelectorAll("#tableBody tr");

  data.forEach((entry) => {

    rows.forEach((row, index) => {

      const engineer = row.getAttribute("data-engineer");
      if (engineer !== entry.engineerName) return;

      document.getElementById(`wo_${index}`).value = entry.workshopOnsite || "";
      document.getElementById(`call_${index}`).value = entry.callType || "";
      document.getElementById(`ps_${index}`).value = entry.primarySecondary || "";
      document.getElementById(`complaint_${index}`).value = entry.complaint || "";
      document.getElementById(`customer_${index}`).value = entry.customerName || "";
      document.getElementById(`machine_${index}`).value = entry.machineNo || "";
      document.getElementById(`contact_${index}`).value = entry.contactNumber || "";
      document.getElementById(`hmr_${index}`).value = entry.hmr || "";
      document.getElementById(`status_${index}`).value = entry.breakdownStatus || "";
      document.getElementById(`callid_${index}`).value = entry.callId || "";
      document.getElementById(`labour_${index}`).value = entry.labourCharge || "";
      document.getElementById(`location_${index}`).value = entry.siteLocation || "";
      document.getElementById(`km_${index}`).value = entry.siteDistance || "";

      applyRowLockState(row, index);
      row.style.border = "2px solid green";
    });

  });

  recalculateTADA();
}

/* ===============================
   RENDER ENGINEERS (TABLE MODE)
================================= */
function renderEngineers(engineers) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  engineers.forEach((engineer, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-engineer", engineer);

    row.innerHTML = `
      <td>${engineer}</td>

      <!-- W/O -->
      <td>
        <select id="wo_${index}">
          <option value=""></option>
          <option>Workshop</option>
          <option>Onsite</option>
          <option>Free</option>
          <option>Leave</option>
          <option>Absent</option>
        </select>
      </td>

      <!-- Machine No -->
      <td><input id="machine_${index}"></td>

      <!-- Customer -->
      <td class="customer-cell">
        <div class="customer-wrapper">
          <input id="customer_${index}" class="customer-input">
          <div class="customer-spinner hidden" id="customerLoader_${index}"></div>
        </div>
      </td>

      <!-- Contact No (10 digit mobile) -->
      <td>
        <input id="contact_${index}"
               type="tel"
               inputmode="numeric"
               pattern="[0-9]{10}"
               maxlength="10"
               placeholder="">
      </td>

      <!-- Complaint -->
      <td><input id="complaint_${index}"></td>

      <!-- HMR (Whole number) -->
      <td>
        <input id="hmr_${index}"
               type="number"
               min="0"
               step="1">
      </td>

      <!-- Call Type -->
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

      <!-- P/S -->
      <td>
        <select id="ps_${index}">
          <option value=""></option>
          <option>Primary</option>
          <option>Secondary</option>
        </select>
      </td>

      <!-- Status -->
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

      <!-- M/C Location -->
      <td><input id="location_${index}"></td>

      <!-- KM (Whole number) -->
      <td>
        <input id="km_${index}"
               type="number"
               min="0"
               step="1">
      </td>

      <!-- Call ID -->
      <td><input id="callid_${index}"></td>

      <!-- Labour (Whole number) -->
      <td>
        <input id="labour_${index}"
               type="number"
               min="0"
               step="1">
      </td>

      <!-- TA DA -->
      <td><input id="total_${index}" readonly></td>
    `;

    tbody.appendChild(row);
  });

  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach((row, index) => {

    const woSelect = document.getElementById(`wo_${index}`);
    const labourInput = document.getElementById(`labour_${index}`);
    const kmInput = document.getElementById(`km_${index}`);
    const machineInput = document.getElementById(`machine_${index}`);
    const contactInput = document.getElementById(`contact_${index}`);

    // Restrict contact to digits only (extra safety)
    contactInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });

    // W/O change
    woSelect.addEventListener("change", () => {
      applyRowLockState(row, index);
      recalculateTADA();
    });

    // Labour change
    labourInput.addEventListener("input", recalculateTADA);

    // KM change
    kmInput.addEventListener("input", recalculateTADA);

    // Machine No change
    machineInput.addEventListener("input", () => {
     recalculateTADA();

       machineInput.addEventListener("blur", () => {
        const machineNo = machineInput.value.trim();
      
        // Reset cached value if changed
        if (machineInput.getAttribute("data-fetched") !== machineNo) {
          machineInput.removeAttribute("data-fetched");
        }
      
        fetchMachineDetails(machineNo, index);
      });
       
   });

    // Initial row setup
    applyRowLockState(row, index);
  });

  // After all rows are initialized, calculate once
  recalculateTADA();
}
   
function shouldLockRowByWorkType(workType) {
  return NON_DEPUTATION_WORK_TYPES.includes(workType);
}

function toNumberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function recalculateTADA() {

  const rows = document.querySelectorAll("#tableBody tr");

  // Group rows by Machine No
  const machineGroups = {};

  rows.forEach((row, index) => {
    const wo = document.getElementById(`wo_${index}`).value;
    const machineNo = document.getElementById(`machine_${index}`).value.trim();

    if (wo !== "Onsite" || machineNo === "") {
      document.getElementById(`total_${index}`).value = "";
      return;
    }

    if (!machineGroups[machineNo]) {
      machineGroups[machineNo] = [];
    }

    machineGroups[machineNo].push(index);
  });

  // Process each machine group
  Object.keys(machineGroups).forEach(machineNo => {

    const group = machineGroups[machineNo];
    const engineerCount = group.length;

    let highLabourCount = 0;

    group.forEach(index => {
      const labour = toNumberOrZero(document.getElementById(`labour_${index}`).value);
      if (labour >= 2360) highLabourCount++;
    });

    // Determine KM slab (take highest KM in group)
    let maxKM = 0;
    group.forEach(index => {
      const km = toNumberOrZero(document.getElementById(`km_${index}`).value);
      if (km > maxKM) maxKM = km;
    });

    // CASE 2: At least one labour ≥ 2360
    if (highLabourCount > 0) {

      if (highLabourCount === engineerCount) {
        // All have high labour → each gets 1000
        group.forEach(index => {
          document.getElementById(`total_${index}`).value = 1000;
        });
      } else {
        // Mixed case → divide 1000 equally
        const divided = Math.floor(1000 / engineerCount);
        group.forEach(index => {
          document.getElementById(`total_${index}`).value = divided;
        });
      }

      return;
    }

    // CASE 1: All labour < 2360
    let slabAmount = 0;

    if (maxKM >= 150) {
      slabAmount = 750;
    } else if (maxKM > 50) {
      slabAmount = 500;
    } else {
      slabAmount = 250;
    }

    const divided = Math.floor(slabAmount / engineerCount);

    group.forEach(index => {
      document.getElementById(`total_${index}`).value = divided;
    });

  });
}

function applyRowLockState(row, index) {
  const workType = document.getElementById(`wo_${index}`).value;
  const shouldLock = shouldLockRowByWorkType(workType);

  const editableFields = row.querySelectorAll(
    "td:not(:first-child):not(:nth-child(2)) input, td:not(:first-child):not(:nth-child(2)) select"
  );

  editableFields.forEach((field) => {
    field.disabled = shouldLock;
  });

  if (shouldLock) {
    editableFields.forEach((field) => {
      if (field.tagName === "INPUT") {
        field.value = "";
      } else if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
      }
    });
  }

  row.classList.toggle("row-readonly", shouldLock);
}

/* ===============================
   SAVE ALL ENGINEERS
================================= */
async function saveAll() {

  showLoader("Saving data..."); 
   
  const saveBtn = document.getElementById("saveAllBtn");
  const rows = document.querySelectorAll("#tableBody tr");

  if (!rows.length) {
    alert("No engineers loaded ❗");
    return;
  }

  const branch = document.getElementById("branchTitle").innerText;

  saveBtn.disabled = true;
  saveBtn.innerText = "Saving... ⏳";

  const savePromises = [];
  let skippedCount = 0;

  rows.forEach((row, index) => {
    row.classList.remove("missing");

    const engineer = row.getAttribute("data-engineer");
    const machineNo = document.getElementById(`machine_${index}`).value.trim();
    const workType = document.getElementById(`wo_${index}`).value;
    const isNonDeputationType = shouldLockRowByWorkType(workType);

    if (!machineNo && !isNonDeputationType) {
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
     contactNumber: document.getElementById(`contact_${index}`).value,
     machineNo: document.getElementById(`machine_${index}`).value,
     hmr: document.getElementById(`hmr_${index}`).value,
     breakdownStatus: document.getElementById(`status_${index}`).value,
     siteLocation: document.getElementById(`location_${index}`).value,
     callId: document.getElementById(`callid_${index}`).value,
     labourCharge: document.getElementById(`labour_${index}`).value,
     siteDistance: document.getElementById(`km_${index}`).value,
     totalAllowances: document.getElementById(`total_${index}`).value
   };

    const request = fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((response) => ({ response, row }));

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
      } else if (response.status === "updated") {
        successCount++;
        row.style.border = "2px solid orange";
      } else if (response.status === "duplicate") {
        duplicateCount++;
        row.style.border = "2px solid red";
      }
    });

    showSummaryPopup(successCount, duplicateCount, skippedCount);
  } catch (error) {
    console.error("Save error:", error);
    alert("Unexpected error occurred ❗");
  }
   hideLoader();
  saveBtn.disabled = false;
  saveBtn.innerText = "💾 Save All Engineers";

   
}

/* ===============================
   POPUP FUNCTIONS
================================= */
function showSummaryPopup(saved, duplicates, skipped) {
  document.getElementById("popupText").innerText =
    `Saved: ${saved}\n` + `Duplicates: ${duplicates}\n` + `Incomplete: ${skipped}`;

  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}


function fetchMachineDetails(machineNo, index) {

  if (!machineNo) return;

  const machineInput = document.getElementById(`machine_${index}`);
  const customerInput = document.getElementById(`customer_${index}`);
  const spinner = document.getElementById(`customerLoader_${index}`);

  const lastFetched = machineInput.getAttribute("data-fetched");

  // Prevent duplicate fetch
  if (lastFetched === machineNo) return;

  spinner.classList.remove("hidden");

  jsonpRequest(
    { action: "getMachineDetails", machineNo },
    (response = {}) => {

      spinner.classList.add("hidden");

      if (response.customer) {
        customerInput.value = response.customer;
      }

      // Mark as fetched even if not found
      machineInput.setAttribute("data-fetched", machineNo);
    }
  );
}

function showManualCustomerPopup(index) {

  const overlay = document.createElement("div");
  overlay.className = "machine-popup-overlay";

  overlay.innerHTML = `
    <div class="machine-popup">
      <h3>Machine No not found ❗</h3>
      <p>Enter Customer Name Manually:</p>
      <input type="text" id="manualCustomerInput">
      <button id="manualCustomerSave">Save</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const machineInput = document.getElementById(`machine_${index}`);
  const customerInput = document.getElementById(`customer_${index}`);
  const checkIcon = document.getElementById(`customerCheck_${index}`);

  document.getElementById("manualCustomerSave").addEventListener("click", () => {

    const manualName = document.getElementById("manualCustomerInput").value.trim();
    if (!manualName) return;

    customerInput.value = manualName;
    customerInput.readOnly = true;

    // ✅ VERY IMPORTANT — mark machine as fetched
    machineInput.setAttribute("data-fetched", machineInput.value.trim());

    checkIcon.classList.remove("hidden");

    overlay.remove();
  });
}

const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

const NON_DEPUTATION_WORK_TYPES = ["Free", "Leave", "Absent"];
let currentBranchEngineers = [];
let hasUnsavedChanges = false;
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

   if (hasUnsavedChanges) {
     showUnsavedPopup();
     return;
   }

  showLoader("Loading branch data...");
  document.getElementById("saveAllBtn").disabled = false;
  // Show hidden content
  document.getElementById("branchContent").style.display = "block";
  

  document.getElementById("branchHiddenTitle").innerText = branch;

  const menuLabel = document.getElementById("deputationMenuLabel");
  menuLabel.innerText = `Deputation >> ${branch} ▾`;

  jsonpRequest({ action: "getEngineers", location: branch }, (engineers = []) => {
    currentBranchEngineers = engineers;
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

  const tbody = document.getElementById("tableBody");
  const usedRows = new Set();

  data.forEach((entry) => {

    let rows = [...tbody.querySelectorAll("tr")];

    // Try to find unused base row
    let targetRow = rows.find((row, index) => {
      const engineer = row.getAttribute("data-engineer");
      return engineer === entry.engineerName && !usedRows.has(index);
    });

    let rowIndex;

    // If no available base row, create additional row
    if (!targetRow) {
      addAdditionalRow();
      rows = [...tbody.querySelectorAll("tr")];
      rowIndex = rows.length - 1;
      targetRow = rows[rowIndex];

      // Set engineer dropdown value
      const engineerDropdown = targetRow.querySelector("select[id^='engineer_']");
      if (engineerDropdown) {
        engineerDropdown.value = entry.engineerName;
      }
    } else {
      rowIndex = rows.indexOf(targetRow);
    }

    usedRows.add(rowIndex);

    // Fill data
    document.getElementById(`wo_${rowIndex}`).value = entry.workshopOnsite || "";
    document.getElementById(`call_${rowIndex}`).value = entry.callType || "";
    document.getElementById(`ps_${rowIndex}`).value = entry.primarySecondary || "";
    document.getElementById(`complaint_${rowIndex}`).value = entry.complaint || "";
    document.getElementById(`customer_${rowIndex}`).value = entry.customerName || "";
    document.getElementById(`machine_${rowIndex}`).value = entry.machineNo || "";
    document.getElementById(`contact_${rowIndex}`).value = entry.contactNumber || "";
    document.getElementById(`hmr_${rowIndex}`).value = entry.hmr || "";
    document.getElementById(`status_${rowIndex}`).value = entry.breakdownStatus || "";
    document.getElementById(`callid_${rowIndex}`).value = entry.callId || "";
    document.getElementById(`labour_${rowIndex}`).value = entry.labourCharge || "";
    document.getElementById(`location_${rowIndex}`).value = entry.siteLocation || "";
    document.getElementById(`km_${rowIndex}`).value = entry.siteDistance || "";

    applyRowLockState(targetRow, rowIndex);
     updateRowColor(targetRow, rowIndex);
  });

  recalculateTADA();

   // Re-apply row colors for all rows after load
   const rows = document.querySelectorAll("#tableBody tr");
   rows.forEach((row, index) => {
     updateRowColor(row, index);
   });
   
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
      
        hasUnsavedChanges = true;
        applyRowLockState(row, index);
        updateRowColor(row, index);
        recalculateTADA();
        updateRowColor(row, index);
      
        const workType = woSelect.value;
        const complaintInput = document.getElementById(`complaint_${index}`);
      
        // 🚀 Auto focus complaint for non-deputation types
        if (NON_DEPUTATION_WORK_TYPES.includes(workType)) {
          setTimeout(() => {
            complaintInput.focus();
          }, 50);
        }
      });

    // Labour change
    labourInput.addEventListener("input", recalculateTADA);

    // KM change
    kmInput.addEventListener("input", recalculateTADA);

    // Machine No change
    machineInput.addEventListener("input", () => {
     recalculateTADA();
       updateRowColor(row, index);

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
    updateRowColor(row, index);
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

  const allFields = row.querySelectorAll(
    "td:not(:first-child):not(:nth-child(2)) input, td:not(:first-child):not(:nth-child(2)) select"
  );

  allFields.forEach((field) => {

    const isComplaintField = field.id === `complaint_${index}`;

    if (isComplaintField) {
      // 🚀 Complaint ALWAYS editable
      field.disabled = false;
      field.style.cursor = "text";
      field.style.background = "white";
      return;
    }

    field.disabled = shouldLock;
  });

  if (shouldLock) {
    allFields.forEach((field) => {

      const isComplaintField = field.id === `complaint_${index}`;
      if (isComplaintField) return;

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

  const saveBtn = document.getElementById("saveAllBtn");
  const rows = document.querySelectorAll("#tableBody tr");

  if (!rows.length) {
    alert("No engineers loaded ❗");
    return;
  }

  showLoader("Saving data...");
  saveBtn.disabled = true;
  saveBtn.innerText = "Saving... ⏳";

  const branch = document.getElementById("branchHiddenTitle").innerText;

  const savePromises = [];
  let skippedCount = 0;

  rows.forEach((row, index) => {

    row.classList.remove("missing");

    let engineer = row.getAttribute("data-engineer");
   
   if (!engineer) {
     const engineerDropdown = row.querySelector("select[id^='engineer_']");
     engineer = engineerDropdown ? engineerDropdown.value : "";
   }

   // 🚨 Prevent saving additional row if engineer not selected
   if (!engineer) {
     skippedCount++;
     row.classList.add("missing");
     return;
   }  
    const machineNo = document.getElementById(`machine_${index}`).value.trim();
    const workType = document.getElementById(`wo_${index}`).value;
    const isNonDeputationType = shouldLockRowByWorkType(workType);

    const complaint = document.getElementById(`complaint_${index}`).value.trim();

      let isRowInvalid = false;
      
      // 🚨 Complaint is ALWAYS mandatory
      if (!complaint) {
        isRowInvalid = true;
      }
      
      // 🚨 Machine No mandatory ONLY if not Free/Leave/Absent
      if (!machineNo && !isNonDeputationType) {
        isRowInvalid = true;
      }
      
      if (isRowInvalid) {
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
      machineNo: machineNo,
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
      .then(res => res.json())
      .then(response => ({ response, row }));

    savePromises.push(request);
  });

  // 🚨 FIX: Handle empty saves BEFORE waiting
  if (!savePromises.length) {
    hideLoader();  // ✅ IMPORTANT FIX
    showSummaryPopup(0, 0, skippedCount);
    saveBtn.disabled = false;
    saveBtn.innerText = "Save Changes";
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
     hasUnsavedChanges = false;

  } catch (error) {
    console.error("Save error:", error);
    alert("Unexpected error occurred ❗");
  }

  // ✅ Always clean up
  hideLoader();
  saveBtn.disabled = false;
  saveBtn.innerText = "Save Changes";
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



function addAdditionalRow() {

  const tbody = document.getElementById("tableBody");
  const newIndex = document.querySelectorAll("#tableBody tr").length;

  const row = document.createElement("tr");
  row.classList.add("additional-row");

  // Build engineer dropdown
  let engineerOptions = `<option value=""></option>`;
  currentBranchEngineers.forEach(name => {
    engineerOptions += `<option value="${name}">${name}</option>`;
  });

  row.innerHTML = `
    <td>
      <select id="engineer_${newIndex}">
        ${engineerOptions}
      </select>
      <button onclick="removeRow(this)" class="delete-btn">🗑</button>
    </td>

    <td>
      <select id="wo_${newIndex}">
        <option value=""></option>
        <option>Workshop</option>
        <option>Onsite</option>
        <option>Free</option>
        <option>Leave</option>
        <option>Absent</option>
      </select>
    </td>

    <td><input id="machine_${newIndex}"></td>

    <td>
      <div class="customer-wrapper">
        <input id="customer_${newIndex}">
      </div>
    </td>

    <td>
      <input id="contact_${newIndex}" type="tel" maxlength="10">
    </td>

    <td><input id="complaint_${newIndex}"></td>

    <td>
      <input id="hmr_${newIndex}" type="number" min="0" step="1">
    </td>

    <td>
      <select id="call_${newIndex}">
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
      <select id="ps_${newIndex}">
        <option value=""></option>
        <option>Primary</option>
        <option>Secondary</option>
      </select>
    </td>

    <td>
      <select id="status_${newIndex}">
        <option value=""></option>
        <option>Running With Problem</option>
        <option>Breakdown</option>
        <option>PDI</option>
        <option>Service</option>
        <option>Installation</option>
        <option>Visit</option>
      </select>
    </td>

    <td><input id="location_${newIndex}"></td>

    <td>
      <input id="km_${newIndex}" type="number" min="0" step="1">
    </td>

    <td><input id="callid_${newIndex}"></td>

    <td>
      <input id="labour_${newIndex}" type="number" min="0" step="1">
    </td>

    <td><input id="total_${newIndex}" readonly></td>
  `;

  tbody.appendChild(row);

  attachRowEvents(newIndex);
}



function attachRowEvents(index) {

  const row = document.querySelectorAll("#tableBody tr")[index];

  const woSelect = document.getElementById(`wo_${index}`);
  const labourInput = document.getElementById(`labour_${index}`);
  const kmInput = document.getElementById(`km_${index}`);
  const contactInput = document.getElementById(`contact_${index}`);

  if (contactInput) {
    contactInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  if (woSelect) {
    woSelect.addEventListener("change", () => {

       hasUnsavedChanges = true;
       applyRowLockState(row, index);
       updateRowColor(row, index);
      recalculateTADA();
       updateRowColor(row, index);

      const workType = woSelect.value;
      const complaintInput = document.getElementById(`complaint_${index}`);

      if (NON_DEPUTATION_WORK_TYPES.includes(workType)) {
        setTimeout(() => complaintInput.focus(), 50);
      }
    });
  }

  if (labourInput) labourInput.addEventListener("input", recalculateTADA);
  if (kmInput) kmInput.addEventListener("input", recalculateTADA);

  applyRowLockState(row, index);
   updateRowColor(row, index);
}


function removeRow(button) {
  const row = button.closest("tr");
  row.remove();
  recalculateTADA();
}


/* ===============================
   AUTO HIDE SAVE BUTTON ON SCROLL UP
================================= */

let lastScrollTop = 0;

window.addEventListener("scroll", function () {

  const saveBtn = document.getElementById("saveAllBtn");
  if (!saveBtn) return;

  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  // If scrolling down → show button
  if (currentScroll > lastScrollTop) {
    saveBtn.classList.remove("hide-on-scroll");
  } 
  // If scrolling up → hide button
  else {
    saveBtn.classList.add("hide-on-scroll");
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

});






/* ===============================
   UPDATE ROW COLOR STATUS
================================= */

function updateRowColor(row, index) {

  const wo = document.getElementById(`wo_${index}`).value;
  const machine = document.getElementById(`machine_${index}`).value.trim();
  const complaint = document.getElementById(`complaint_${index}`).value.trim();

  // Reset classes first
  row.classList.remove("row-nondeputation");
  row.classList.remove("row-complete");

  // 1️⃣ Non-deputation types → Pink
  if (NON_DEPUTATION_WORK_TYPES.includes(wo)) {
    row.classList.add("row-nondeputation");
    return;
  }

  // 2️⃣ Mandatory fields check (Machine + Complaint)
  if (machine && complaint) {
    row.classList.add("row-complete");
  }
}


function showUnsavedPopup() {
  document.getElementById("unsavedPopup").classList.remove("hidden");
}

function closeUnsavedPopup() {
  document.getElementById("unsavedPopup").classList.add("hidden");
}

function forceSave() {
  closeUnsavedPopup();
  saveAll();
}


/* ===============================
   FINALIZE & PRINT REPORT
================================= */

function finalizeAndPrint() {

  const branch = document.getElementById("branchHiddenTitle").innerText;
  const today = new Date().toLocaleDateString();
  const printTime = new Date().toLocaleString();

  const rows = document.querySelectorAll("#tableBody tr");

  let onsite = 0, workshop = 0, absent = 0, leave = 0, free = 0;

  let tableRows = "";

  rows.forEach((row, index) => {

    const engineer =
      row.getAttribute("data-engineer") ||
      (document.getElementById(`engineer_${index}`)?.value || "");

    const wo = document.getElementById(`wo_${index}`).value;

    if (!engineer || !wo) return;

    if (wo === "Onsite") onsite++;
    if (wo === "Workshop") workshop++;
    if (wo === "Absent") absent++;
    if (wo === "Leave") leave++;
    if (wo === "Free") free++;

    tableRows += `
      <tr>
        <td>${engineer}</td>
        <td>${wo}</td>
        <td>${document.getElementById(`machine_${index}`).value}</td>
        <td>${document.getElementById(`customer_${index}`).value}</td>
        <td>${document.getElementById(`contact_${index}`).value}</td>
        <td>${document.getElementById(`complaint_${index}`).value}</td>
        <td>${document.getElementById(`hmr_${index}`).value}</td>
        <td>${document.getElementById(`call_${index}`).value}</td>
        <td>${document.getElementById(`ps_${index}`).value}</td>
        <td>${document.getElementById(`status_${index}`).value}</td>
        
        <td>${document.getElementById(`callid_${index}`).value}</td>
        <td>${document.getElementById(`labour_${index}`).value}</td>
       
      </tr>
    `;
  });

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
    <head>
      <title>Deputation Report</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
      
        body { 
          font-family: Arial; 
          font-size: 9px; 
        }
      
        h2 { 
          text-align: center; 
          margin-bottom: 10px; 
          font-size: 13px;
        }
      
        table { 
          width: 100%; 
          border-collapse: collapse; 
        }
      
        th, td { 
          border: 1px solid #000; 
          padding: 3px; 
          text-align: center; 
          font-size: 8.5px;
        }
      
        th { 
          background: #f0f0f0; 
          font-weight: bold;
        }
      
        .footer {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
        }
      
        .summary {
          font-size: 9px;
        }
      </style>
    </head>
    <body>

      <h2>
        SERVICE ENGINEER DEPUTATION CHART & DAILY REPORT FOR ${branch}  
        <br>
        DATE: ${today}
      </h2>

      <table>
        <thead>
          <tr>
            <th>Engineer</th>
            <th>W/O</th>
            <th>Machine No</th>
            <th>Customer</th>
            <th>Contact No</th>
            <th>Complaint</th>
            <th>HMR</th>
            <th>Call Type</th>
            <th>P/S</th>
            <th>Status</th>
            
            <th>Call ID</th>
            <th>Labour</th>
            
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <div class="summary">
          <strong>Deputation Summary</strong><br>
          Onsite: ${onsite}<br>
          Workshop: ${workshop}<br>
          Absent: ${absent}<br>
          Leave: ${leave}<br>
          Free: ${free}
        </div>

        <div>
          <strong>Report Print Date & Time:</strong><br>
          ${printTime}
        </div>
      </div>

    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}




window.addEventListener("beforeunload", function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
  }
});

const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";
let currentCallbackName = null;

function loadBranch(branch) {
  document.getElementById("branchTitle").innerText = branch;
  document.getElementById("engineerContainer").innerHTML = "Loading...";
  document.getElementById("saveAllBtn").style.display = "inline-block";

  currentCallbackName = "handleEngineers_" + Date.now();

  window[currentCallbackName] = function (engineers) {

    renderEngineers(branch, engineers);

    loadTodayData(branch); // 🔥 NEW
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?action=getEngineers" +
    "&location=" + encodeURIComponent(branch) +
    "&callback=" + currentCallbackName;

  document.body.appendChild(script);
}


function loadTodayData(branch) {

  const callbackName = "handleToday_" + Date.now();

  window[callbackName] = function (data) {

    data.forEach(entry => {

      const cards = document.querySelectorAll(".engineer-card");

      cards.forEach((card, index) => {

        const engineer = card.getAttribute("data-engineer");

        if (engineer === entry.engineerName) {

          const id = "eng_" + index;

          document.getElementById(`${id}_workshop`).value = entry.workshopOnsite || "";
          document.getElementById(`${id}_callType`).value = entry.callType || "";
          document.getElementById(`${id}_primary`).value = entry.primarySecondary || "";
          document.getElementById(`${id}_complaint`).value = entry.complaint || "";
          document.getElementById(`${id}_customer`).value = entry.customerName || "";
          document.getElementById(`${id}_contact`).value = entry.contactNumber || "";
          document.getElementById(`${id}_machine`).value = entry.machineNo || "";
          document.getElementById(`${id}_hmr`).value = entry.hmr || "";
          document.getElementById(`${id}_breakdown`).value = entry.breakdownStatus || "";
          document.getElementById(`${id}_siteLocation`).value = entry.siteLocation || "";
          document.getElementById(`${id}_callId`).value = entry.callId || "";
          document.getElementById(`${id}_labour`).value = entry.labourCharge || "";
          document.getElementById(`${id}_distance`).value = entry.siteDistance || "";
          document.getElementById(`${id}_total`).value = entry.totalAllowances || "";

          card.style.border = "2px solid green";
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





function renderEngineers(branch, engineers) {
  const container = document.getElementById("engineerContainer");
  container.innerHTML = "";

  engineers.forEach((engineer, index) => {
    const id = "eng_" + index;

    const card = document.createElement("div");
    card.className = "engineer-card";
    card.setAttribute("data-engineer", engineer);

    card.innerHTML = `
      <form class="engineer-row-fields" autocomplete="off" aria-label="Engineer details for ${engineer}">
        <span class="engineer-name">${engineer}</span>
        <select id="${id}_workshop" aria-label="Work type">
          <option value="">Workshop / Onsite</option>
          <option value="Workshop">Workshop</option>
          <option value="Onsite">Onsite</option>
          <option value="Free">Free</option>
          <option value="Leave">Leave</option>
          <option value="Absent">Absent</option>
        </select>
        <select id="${id}_callType" aria-label="Call Type">
          <option value="">Call Type</option>
          <option>U/W</option>
          <option>B/W</option>
          <option>P/T</option>
          <option>P/W</option>
          <option>JCB CARE</option>
          <option>ASC</option>
          <option>Goodwill</option>
        </select>
        <select id="${id}_primary" aria-label="Primary or Secondary">
          <option value="">Primary/Secondary</option>
          <option>Primary</option>
          <option>Secondary</option>
        </select>
        <input id="${id}_complaint" placeholder="Complaint" aria-label="Complaint" maxlength="40">
        <input id="${id}_customer" placeholder="Customer" aria-label="Customer Name" maxlength="30">
        <input id="${id}_contact" placeholder="Contact" aria-label="Contact Number" maxlength="15" pattern="[0-9]*">
        <input id="${id}_machine" placeholder="Machine No" aria-label="Machine Number" maxlength="20" required>
        <input id="${id}_hmr" placeholder="HMR" aria-label="HMR" maxlength="10">
        <select id="${id}_breakdown" aria-label="Breakdown Status">
          <option value="">Breakdown Status</option>
          <option>Running With Problem</option>
          <option>Breakdown</option>
          <option>PDI</option>
          <option>Service</option>
          <option>Installation</option>
          <option>Visit</option>
        </select>
        <input id="${id}_siteLocation" placeholder="Site Location" aria-label="Site Location" maxlength="30">
        <input id="${id}_labour" placeholder="Labour" aria-label="Labour Charge" maxlength="10">
        <input id="${id}_distance" placeholder="Distance (KM)" aria-label="Site Distance" maxlength="6">
      </form>
    `;

    container.appendChild(card);

    // Add event listeners for workshop buttons
    const workshopSelect = card.querySelector(`#${id}_workshop`);
    const allInputs = card.querySelectorAll('input, select');
    workshopSelect.addEventListener('change', function() {
      if (["Free", "Leave", "Absent"].includes(workshopSelect.value)) {
        allInputs.forEach(input => {
          if (input !== workshopSelect) {
            input.readOnly = true;
            input.classList.add('faded');
            if (input.tagName === 'SELECT') input.disabled = true;
          }
        });
      } else {
        allInputs.forEach(input => {
          if (input !== workshopSelect) {
            input.readOnly = false;
            input.classList.remove('faded');
            if (input.tagName === 'SELECT') input.disabled = false;
          }
        });
      }
    });
  });
}


function highlightMissing() {
  document.querySelectorAll(".engineer-card").forEach(card => {
    const input = card.querySelector("input");
    if (input && !input.value) {
      card.classList.add("missing");
    }
  });
}


function saveEngineer(branch, engineer, id) {
  const machineNo = document.getElementById(`${id}_machine`).value;

  if (!machineNo) {
    alert("Machine Number is mandatory ❗");
    return;
  }

  const payload = {
    officeLocation: branch,
    engineerName: engineer,
    workshopOnsite: document.getElementById(`${id}_workshop`).value,
    callType: document.getElementById(`${id}_callType`).value,
    primarySecondary: document.getElementById(`${id}_primary`).value,
    complaint: document.getElementById(`${id}_complaint`).value,
    customerName: document.getElementById(`${id}_customer`).value,
    contactNumber: document.getElementById(`${id}_contact`).value,
    machineNo: machineNo,
    hmr: document.getElementById(`${id}_hmr`).value,
    breakdownStatus: document.getElementById(`${id}_breakdown`).value,
    siteLocation: document.getElementById(`${id}_siteLocation`).value,
    callId: document.getElementById(`${id}_callId`).value,
    labourCharge: document.getElementById(`${id}_labour`).value,
    siteDistance: document.getElementById(`${id}_distance`).value,
    totalAllowances: document.getElementById(`${id}_total`).value
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(response => {
      if (response.status === "duplicate") {
        showDuplicatePopup(response.engineer, response.machine);
      } else {
        alert(`${engineer} saved ✔️`);
      }
    });
}



function showDuplicatePopup(engineer, machine) {
  document.getElementById("popupText").innerText =
    `${engineer} has already been deputed for ${machine} today`;

  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}


async function saveAll() {
  const saveBtn = document.getElementById("saveAllBtn");
  const cards = document.querySelectorAll(".engineer-card");

  if (!cards.length) {
    alert("No engineers loaded ❗");
    return;
  }

  const branch = document.getElementById("branchTitle").innerText;

  // 🔒 Prevent double click
  saveBtn.disabled = true;
  saveBtn.innerText = "Saving... ⏳";

  let savePromises = [];
  let skippedCount = 0;

  cards.forEach((card, index) => {
    card.classList.remove("missing");

    const engineer = card.getAttribute("data-engineer");
    const id = "eng_" + index;

    const machineNo = document.getElementById(`${id}_machine`).value.trim();

    // 🚨 Required validation
    if (!machineNo) {
      skippedCount++;
      card.classList.add("missing");
      return;
    }

    const payload = {
      officeLocation: branch,
      engineerName: engineer,
      workshopOnsite: document.getElementById(`${id}_workshop`).value,
      callType: document.getElementById(`${id}_callType`).value,
      primarySecondary: document.getElementById(`${id}_primary`).value,
      complaint: document.getElementById(`${id}_complaint`).value,
      customerName: document.getElementById(`${id}_customer`).value,
      contactNumber: document.getElementById(`${id}_contact`).value,
      machineNo: machineNo,
      hmr: document.getElementById(`${id}_hmr`).value,
      breakdownStatus: document.getElementById(`${id}_breakdown`).value,
      siteLocation: document.getElementById(`${id}_siteLocation`).value,
      callId: document.getElementById(`${id}_callId`).value,
      labourCharge: document.getElementById(`${id}_labour`).value,
      siteDistance: document.getElementById(`${id}_distance`).value,
      totalAllowances: document.getElementById(`${id}_total`).value
    };

    const request = fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    }).then(res => res.json())
      .then(response => ({ response, card }));

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

    results.forEach(({ response, card }) => {
      if (response.status === "success") {
          successCount++;
          card.style.opacity = "0.5";
      } 
      else if (response.status === "updated") {
          successCount++;
          card.style.border = "2px solid orange";
      }

    });

    showSummaryPopup(successCount, duplicateCount, skippedCount);

  } catch (error) {
    console.error("Save error:", error);
    alert("Unexpected error occurred ❗");
  }

  // 🔓 Re-enable button
  saveBtn.disabled = false;
  saveBtn.innerText = "💾 Save All Engineers";
}



function showSummaryPopup(saved, duplicates, skipped) {
  document.getElementById("popupText").innerText =
    `Saved: ${saved}\n` +
    `Duplicates: ${duplicates}\n` +
    `Incomplete: ${skipped}`;

  document.getElementById("popup").classList.remove("hidden");
}

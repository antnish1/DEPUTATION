const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

function loadBranch(branch) {
  document.getElementById("branchTitle").innerText = branch;
  document.getElementById("engineerContainer").innerHTML = "Loading...";
  document.getElementById("saveAllBtn").style.display = "inline-block";

  const callbackName = "handleEngineers";
  window[callbackName] = function (engineers) {
    renderEngineers(branch, engineers);
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?action=getEngineers" +
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

    card.innerHTML = `
      <h4>${engineer}</h4>

      <select id="${id}_workshop">
        <option value="">Workshop / Onsite</option>
        <option>Workshop</option>
        <option>Onsite</option>
        <option>Free</option>
      </select>

      <select id="${id}_callType">
        <option value="">Call Type</option>
        <option>U/W</option>
        <option>B/W</option>
        <option>P/T</option>
        <option>P/W</option>
        <option>JCB CARE</option>
        <option>ASC</option>
        <option>Goodwill</option>
      </select>

      <select id="${id}_primary">
        <option value="">Primary / Secondary</option>
        <option>Primary</option>
        <option>Secondary</option>
      </select>

      <input id="${id}_complaint" placeholder="Complaint">
      <input id="${id}_customer" placeholder="Customer Name">
      <input id="${id}_contact" placeholder="Contact Number">
      <input id="${id}_machine" placeholder="Machine No">
      <input id="${id}_hmr" placeholder="HMR">

      <select id="${id}_breakdown">
        <option value="">Breakdown Status</option>
        <option>Running With Problem</option>
        <option>Breakdown</option>
        <option>PDI</option>
        <option>Service</option>
        <option>Installation</option>
        <option>Visit</option>
      </select>

      <input id="${id}_siteLocation" placeholder="Site Location">
      <input id="${id}_callId" placeholder="Call ID">
      <input id="${id}_labour" placeholder="Labour Charge">
      <input id="${id}_distance" placeholder="Site Distance (KM)">

      <input id="${id}_total" placeholder="TA+DA+Allowances" readonly>

      <button onclick="saveEngineer('${branch}','${engineer}','${id}')">
        Save
      </button>
    `;

    container.appendChild(card);
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
  const payload = {
    officeLocation: branch,
    engineerName: engineer,

    workshopOnsite: document.getElementById(`${id}_workshop`).value,
    callType: document.getElementById(`${id}_callType`).value,
    primarySecondary: document.getElementById(`${id}_primary`).value,
    complaint: document.getElementById(`${id}_complaint`).value,
    customerName: document.getElementById(`${id}_customer`).value,
    contactNumber: document.getElementById(`${id}_contact`).value,
    machineNo: document.getElementById(`${id}_machine`).value,
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
    .then(() => alert(`${engineer} saved ✔️`));
}


function saveAll() {
  document.querySelectorAll(".engineer-card button")
    .forEach(btn => btn.click());

  alert("All engineers saved ✔️");
}


window[callbackName] = function (engineers) {
  renderEngineers(branch, engineers);
  highlightMissing();
};

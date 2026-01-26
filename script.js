const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL";

function loadBranch(branch) {
  document.getElementById("branchTitle").innerText = branch;
  document.getElementById("engineerContainer").innerHTML = "Loading...";

  fetch(`${API_URL}?action=getEngineers&location=${branch}`)
    .then(res => res.json())
    .then(engineers => renderEngineers(branch, engineers));
}

function renderEngineers(branch, engineers) {
  const container = document.getElementById("engineerContainer");
  container.innerHTML = "";

  engineers.forEach(engineer => {
    container.innerHTML += `
      <div class="engineer-card">
        <h4>${engineer}</h4>

        <input placeholder="Customer Name" id="customer_${engineer}" />
        <input placeholder="Contact Number" id="contact_${engineer}" />
        <input placeholder="Complaint" id="complaint_${engineer}" />
        <input placeholder="Machine No" id="machine_${engineer}" />

        <button onclick="saveEngineer('${branch}', '${engineer}')">
          Save
        </button>
      </div>
    `;
  });
}

function saveEngineer(branch, engineer) {
  const payload = {
    officeLocation: branch,
    engineerName: engineer,
    customerName: document.getElementById(`customer_${engineer}`).value,
    contactNumber: document.getElementById(`contact_${engineer}`).value,
    complaint: document.getElementById(`complaint_${engineer}`).value,
    machineNo: document.getElementById(`machine_${engineer}`).value
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => alert(`${engineer} saved ✔️`));
}

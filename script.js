const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

function loadBranch(branch) {
  document.getElementById("branchTitle").innerText = branch;
  document.getElementById("engineerContainer").innerHTML = "Loading...";

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
    const safeId = "eng_" + index;

    container.innerHTML += `
      <div class="engineer-card">
        <h4>${engineer}</h4>

        <input id="${safeId}_customer" placeholder="Customer Name">
        <input id="${safeId}_contact" placeholder="Contact Number">
        <input id="${safeId}_complaint" placeholder="Complaint">
        <input id="${safeId}_machine" placeholder="Machine No">

        <button onclick="saveEngineer('${branch}','${engineer}','${safeId}')">
          Save
        </button>
      </div>
    `;
  });
}


function saveEngineer(branch, engineer, safeId) {
  const payload = {
    officeLocation: branch,
    engineerName: engineer,
    customerName: document.getElementById(`${safeId}_customer`).value,
    contactNumber: document.getElementById(`${safeId}_contact`).value,
    complaint: document.getElementById(`${safeId}_complaint`).value,
    machineNo: document.getElementById(`${safeId}_machine`).value
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => alert(`${engineer} saved ✔️`));
}

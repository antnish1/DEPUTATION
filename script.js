const API_URL = "https://script.google.com/macros/s/AKfycbwNibttN_UDKbhMsva3n6qZkbVlx45svpO5BZ7xe9e39Q-qRSwN7rv4_0SCyNWASvdm2A/exec";

document.getElementById("location").addEventListener("change", function () {
  fetch(`${API_URL}?action=getEngineers&location=${this.value}`)
    .then(res => res.json())
    .then(data => {
      const engineerSelect = document.getElementById("engineer");
      engineerSelect.innerHTML = '<option value="">Select Engineer</option>';
      data.forEach(e => {
        engineerSelect.innerHTML += `<option>${e}</option>`;
      });
    });
});

function submitForm() {
  const payload = {
    location: document.getElementById("location").value,
    engineer: document.getElementById("engineer").value,
    customerName: document.getElementById("customerName").value,
    contactNumber: document.getElementById("contactNumber").value,
    complaint: document.getElementById("complaint").value
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => alert("Submitted Successfully ✔️"));
}

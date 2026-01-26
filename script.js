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
      officeLocation: location.value,
      engineerName: engineer.value,
      workshopOnsite: workshopOnsite.value,
      callType: callType.value,
      primarySecondary: primarySecondary.value,
      complaint: complaint.value,
      customerName: customerName.value,
      contactNumber: contactNumber.value,
      machineNo: machineNo.value,
      hmr: hmr.value,
      breakdownStatus: breakdownStatus.value,
      complaintDate: complaintDate.value,
      complaintTime: complaintTime.value,
      siteLocation: siteLocation.value,
      deputationDate: deputationDate.value,
      deputationTime: deputationTime.value,
      engineerOnsiteTime: engineerOnsiteTime.value,
      workCompletionDate: workCompletionDate.value,
      workCompletionTime: workCompletionTime.value,
      callId: callId.value,
      labourCharge: labourCharge.value,
      siteDistance: siteDistance.value,
      daApplied: daApplied.value,
      taApproved: taApproved.value,
      daApproved: daApproved.value,
      totalAllowances: totalAllowances.value
    };


  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => alert("Submitted Successfully ✔️"));
}

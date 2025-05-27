// Function to display an error message for a specific field
function showFieldError(field, message) {
  field.classList.add("input-error");
  const errorMessageElement = field.nextElementSibling;
  if (errorMessageElement && errorMessageElement.classList.contains("error-message")) {
    errorMessageElement.textContent = message;
  }
}

// Function to clear an error message for a specific field
function clearFieldError(field) {
  field.classList.remove("input-error");
  const errorMessageElement = field.nextElementSibling;
  if (errorMessageElement && errorMessageElement.classList.contains("error-message")) {
    errorMessageElement.textContent = "";
  }
}

// Function to clear all error messages
function clearAllErrors(form) {
    form.querySelectorAll(".input-error").forEach(field => clearFieldError(field));
    form.querySelectorAll(".error-message").forEach(msg => msg.textContent = "");
}


// Add new row for education
function addRow() {
  const tbody = document.querySelector('#eduTable tbody');
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" name="degree[]" placeholder="e.g., B.Sc."></td>
    <td><input type="text" name="institution[]" placeholder="e.g., University of Dhaka"></td>
    <td><input type="number" name="year[]" placeholder="e.g., 2020" min="1900" max="2100"></td>
    <td><input type="text" name="result[]" placeholder="e.g., 3.50"></td>`;
  tbody.appendChild(newRow);
}

// Update profile picture preview
const profilePictureInput = document.getElementById('profilePicture');
const profilePreview = document.getElementById('profilePreview');

if (profilePictureInput && profilePreview) { // Ensure elements exist
    profilePictureInput.addEventListener('change', function() {
      const file = this.files && this.files.length > 0 ? this.files[0] : null; // Corrected to use this.files[0]
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          profilePreview.src = e.target.result;
        }
        reader.readAsDataURL(file);
      } else {
        profilePreview.src = 'placeholder-image.png'; // Reset to placeholder if no file
      }
    });
}


// Validate form fields
function validateForm(form) {
  let isValid = true;
  clearAllErrors(form); // Clear previous errors

  // Profile Picture (basic check - presence of file is optional for now)
  const profileFileInput = form.elements["profilePicture"];
  const profileFile = profileFileInput ? profileFileInput.files : null;
  const maxSizeMB = 2; // Max size in MB
  if (profileFile && profileFile.length > 0 && profileFile[0].size > maxSizeMB * 1024 * 1024) {
    const profileErrorSpan = form.querySelector('.profile-error-message');
    if (profileErrorSpan) profileErrorSpan.textContent = `Profile picture size should be less than ${maxSizeMB}MB.`;
    // Do not set isValid to false for this, as image is optional or can be corrected later.
    // If image is *required*, then set isValid = false;
  } else {
    const profileErrorSpan = form.querySelector('.profile-error-message');
    if (profileErrorSpan) profileErrorSpan.textContent = "";
  }

  // Full Name
  const fullname = form.elements["fullname"];
  if (!fullname.value.trim()) {
    showFieldError(fullname, "Full Name is required.");
    isValid = false;
  } else {
    clearFieldError(fullname);
  }

  // Birth Date
  const birthdate = form.elements["birthdate"];
  if (!birthdate.value) {
    showFieldError(birthdate, "Birth Date is required.");
    isValid = false;
  } else {
    clearFieldError(birthdate);
  }

  // Gender
  const genderSelected = form.querySelector('input[name="gender"]:checked');
  const genderErrorSpan = form.querySelector('.gender-error-message');
  if (!genderSelected) {
    if (genderErrorSpan) genderErrorSpan.textContent = "Gender is required.";
    isValid = false;
  } else {
     if (genderErrorSpan) genderErrorSpan.textContent = "";
  }


  // Religion
  const religion = form.elements["religion"];
  if (!religion.value) {
    showFieldError(religion, "Religion is required.");
    isValid = false;
  } else {
    clearFieldError(religion);
  }

  // Profession
  const profession = form.elements["profession"];
  if (!profession.value.trim()) {
    showFieldError(profession, "Profession is required.");
    isValid = false;
  } else {
    clearFieldError(profession);
  }

  // Income
  const income = form.elements["income"];
  if (!income.value.trim()) {
    showFieldError(income, "Monthly Income is required.");
    isValid = false;
  } else if (parseFloat(income.value) < 0) {
    showFieldError(income, "Income cannot be negative.");
    isValid = false;
  } else {
    clearFieldError(income);
  }

  // Email
  const email = form.elements["email"];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showFieldError(email, "Email is required.");
    isValid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    showFieldError(email, "Please enter a valid email address.");
    isValid = false;
  } else {
    clearFieldError(email);
  }

  // Phone
  const phone = form.elements["phone"];
  // const phonePattern = /^[0-9]{10,15}$/; // Allows 10 to 15 digits - updated from HTML
  if (!phone.value.trim()) {
    showFieldError(phone, "Phone number is required.");
    isValid = false;
  } else if (!phone.checkValidity()) { // Use HTML5 pattern validation result
    showFieldError(phone, "Please enter a valid phone number (e.g., 01xxxxxxxxx as per pattern).");
    isValid = false;
  } else {
    clearFieldError(phone);
  }

  // Partner Expectations
  const expectations = form.elements["expectations"];
  if (!expectations.value.trim()) {
    showFieldError(expectations, "Partner Expectations are required.");
    isValid = false;
  } else if (expectations.value.trim().length < 50) {
    showFieldError(expectations, "Please describe your expectations in at least 50 characters.");
    isValid = false;
  } else {
    clearFieldError(expectations);
  }

  return isValid;
}


// Handle form submission
document.getElementById("matrimonyForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;

  if (!validateForm(form)) {
    alert("❌ Please correct the errors in the form.");
    return;
  }

  alert("✅ Form validated successfully! You can now download the CSV or PDF.");
  // Optionally, reset the form or redirect:
  // form.reset();
  // if(profilePreview) profilePreview.src = 'placeholder-image.png'; // Reset preview
  // clearAllErrors(form); // Clear errors on successful submission
});

// Save data to CSV
function downloadCSV() {
  const form = document.getElementById("matrimonyForm");
  if (!validateForm(form)) { // Re-validate before download, in case data changed
      alert("❌ Please correct the form errors before downloading CSV.");
      return;
  }

  const formData = new FormData(form);
  let csvContent = "Field,Value\n";

  const educationDegrees = [];
  const educationInstitutions = [];
  const educationYears = [];
  const educationResults = [];

  // Extract all education fields
  form.querySelectorAll('input[name="degree[]"]').forEach(input => educationDegrees.push(input.value));
  form.querySelectorAll('input[name="institution[]"]').forEach(input => educationInstitutions.push(input.value));
  form.querySelectorAll('input[name="year[]"]').forEach(input => educationYears.push(input.value));
  form.querySelectorAll('input[name="result[]"]').forEach(input => educationResults.push(input.value));


  // Handle profile picture filename in CSV
  const profileFileInput = form.elements["profilePicture"];
  const profileFile = profileFileInput && profileFileInput.files.length > 0 ? profileFileInput.files[0] : null;
  csvContent += `"Profile Picture","${profileFile ? profileFile.name : 'N/A'}"\n`;

  formData.forEach((value, key) => {
    // Exclude profilePicture (handled above) and array fields (handled below)
    if (key !== "profilePicture" && !key.endsWith("[]")) {
        csvContent += `"${key}","${value}"\n`;
    }
  });

  // Add structured education data
  if(educationDegrees.length > 0) {
      csvContent += "\nEducation Qualifications\n";
      csvContent += "Degree,Institution,Year,Result/GPA\n";
      for(let i = 0; i < educationDegrees.length; i++) {
          // Only add a row if at least one field in the education entry has a value
          if (educationDegrees[i] || educationInstitutions[i] || educationYears[i] || educationResults[i]) {
            csvContent += `"${educationDegrees[i] || ''}","${educationInstitutions[i] || ''}","${educationYears[i] || ''}","${educationResults[i] || ''}"\n`;
          }
      }
  }


  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "matrimonial_registration.csv";
  document.body.appendChild(a); // Required for Firefox
  a.click();
  document.body.removeChild(a); // Clean up
  URL.revokeObjectURL(url);
}

// Generate PDF
function downloadPDF() {
  const form = document.getElementById("matrimonyForm");
   if (!validateForm(form)) { // Re-validate before download
      alert("❌ Please correct the form errors before downloading PDF.");
      return;
  }

  const container = document.getElementById("form-container");
  alert("Generating PDF... This might take a moment.");

  // Temporarily hide error messages for cleaner PDF
  const errorMessages = container.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.style.display = 'none');

  // Ensure the profile picture preview is visible for the PDF
  if (profilePreview) profilePreview.style.display = 'block';


  html2canvas(container, {
    scale: 2, // Increase scale for better quality
    useCORS: true, // If you have external images/fonts
    logging: false, // Disable logging to console for cleaner output
    onclone: (documentClone) => {
        // If you need to force specific styles in the clone for PDF rendering
        // e.g., ensure background is white if gradient causes issues with html2canvas
        // documentClone.getElementById("form-container").style.background = "white";
    }
  }).then(canvas => {
    errorMessages.forEach(msg => msg.style.display = ''); // Restore error messages display

    const imgData = canvas.toDataURL("image/png", 1.0); // Use full quality PNG
    const { jsPDF } = window.jspdf; // Ensure jsPDF is accessed correctly

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Maintain aspect ratio
    const ratio = canvasWidth / canvasHeight;
    let imgFinalWidth = pdfWidth - 40; // A4 width in points, with 20pt margin on each side
    let imgFinalHeight = imgFinalWidth / ratio;

    // If calculated height is too much for one page, scale it down
    // (or implement multi-page, which is more complex with html2canvas)
    if (imgFinalHeight > pdfHeight - 40) { // 20pt margin top/bottom
        imgFinalHeight = pdfHeight - 40;
        imgFinalWidth = imgFinalHeight * ratio;
    }
    
    // Center the image on the page
    const x = (pdfWidth - imgFinalWidth) / 2;
    const y = 20; // 20pt margin from top


    pdf.addImage(imgData, "PNG", x, y, imgFinalWidth, imgFinalHeight);
    pdf.save("Matrimonial_Form.pdf");
  }).catch(err => {
    errorMessages.forEach(msg => msg.style.display = ''); // Restore on error too
    console.error("Error generating PDF:", err);
    alert("❌ Could not generate PDF. See console for details.");
  });
}
form = () => {
  const form = document.getElementById("matrimonyForm");
  form.reset();
  clearAllErrors(form);
  if (profilePreview) profilePreview.src = 'placeholder-image.png'; // Reset preview
  const tbody = document.querySelector('#eduTable tbody');
  tbody.innerHTML = ''; // Clear all education rows
  addRow(); // Add a new empty row for education
}
GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwn8WzoDulRRvdcHdggdGYtEJ7iwSHQ6-56dRKkKnXkwLtZE9mz6WuzIoinjhQthXM4g/exec'

document.addEventListener('DOMContentLoaded', function () {
	fetch(GOOGLE_SCRIPT_URL)
		.then(response => response.json())
		.then(data => {
			console.log('Fetched Data:', data);
			// You can perform additional operations with the data here
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
});

// Image preview functionality
document.getElementById('faceImage').addEventListener('change', function(event) {
  var reader = new FileReader();
  reader.onload = function(){
    var output = document.getElementById('thumbnail');
    output.src = reader.result;
    output.style.display = 'block';
  };
  reader.readAsDataURL(event.target.files[0]);
});

// Conditional fields based on blood connection
document.getElementById('bloodYes').addEventListener('change', toggleBloodFields);
document.getElementById('bloodNo').addEventListener('change', toggleBloodFields);

function toggleBloodFields() {
  var bloodYesFields = document.getElementById('bloodYesFields');
  var bloodNoFields = document.getElementById('bloodNoFields');
  var isBloodYes = document.getElementById('bloodYes').checked;

  if (isBloodYes) {
    bloodYesFields.style.display = 'block';
    bloodNoFields.style.display = 'none';
    // Set required attributes
    document.getElementById('motherFirstName').setAttribute('required', 'required');
    document.getElementById('fatherFirstName').setAttribute('required', 'required');
    document.getElementById('spouseFirstName').removeAttribute('required');
    document.getElementById('spouseLastName').removeAttribute('required');
  } else {
    bloodYesFields.style.display = 'none';
    bloodNoFields.style.display = 'block';
    // Set required attributes
    document.getElementById('spouseFirstName').setAttribute('required', 'required');
    document.getElementById('spouseLastName').setAttribute('required', 'required');
    document.getElementById('motherFirstName').removeAttribute('required');
    document.getElementById('fatherFirstName').removeAttribute('required');
  }
}

// Form submission handling
document.getElementById('familyForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var form = e.target;

  // Collect data before disabling inputs
  var formData = new FormData(form);

  // Convert formData to a plain object
  var data = {};
  formData.forEach(function(value, key) {
    data[key] = value;
  });

  // Map bloodConnection value from English to Hebrew
  if (data.bloodConnection === 'Yes') {
    data.bloodConnection = 'כן';
  } else if (data.bloodConnection === 'No') {
    data.bloodConnection = 'לא';
  }

  var fileInput = document.getElementById('faceImage');
  var file = fileInput.files[0];

  if (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      // Remove data URL prefix to get only base64 string
      var base64String = reader.result.split(',')[1];
      data.faceImage = base64String;
      data.faceImageContentType = file.type;

      // Send data via fetch
      sendData(data, form);
    };
    reader.readAsDataURL(file);
  } else {
    // No image selected
    data.faceImage = null;
    data.faceImageContentType = null;

    // Send data via fetch
    sendData(data, form);
  }
});

function sendData(data, form) {
  var submitButton = form.querySelector('button[type="submit"]');

  // Disable the submit button and form inputs
  submitButton.disabled = true;
  disableFormInputs(form, true);

  // Show the spinner
  showSpinner(true);

  fetch(GOOGLE_SCRIPT_URL, {
    redirect: "follow",
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
  })
  .then(response => response.json())
  .then(result => {
    // Hide the spinner
    showSpinner(false);

    if (result.status === 'success') {
      // Redirect to the success page
      window.location.href = 'success.html';
    } else {
      // Enable the submit button and form inputs
      submitButton.disabled = false;
      disableFormInputs(form, false);
      showError('שגיאה: ' + result.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    // Hide the spinner
    showSpinner(false);
    // Enable the submit button and form inputs
    submitButton.disabled = false;
    disableFormInputs(form, false);
    showError('אירעה שגיאה בשליחת הנתונים.');
  });
}

function showError(message) {
  var form = document.getElementById('familyForm');
  var errorDiv = document.getElementById('errorDiv');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'errorDiv';
    errorDiv.className = 'alert alert-danger text-center';
    form.insertBefore(errorDiv, form.firstChild);
  }
  errorDiv.innerText = message;
}

function showSpinner(show) {
  var spinner = document.getElementById('spinner');
  if (show) {
    spinner.style.display = 'block';
  } else {
    spinner.style.display = 'none';
  }
}

function disableFormInputs(form, disable) {
  var inputs = form.querySelectorAll('input, select, textarea, button');
  inputs.forEach(function(input) {
    input.disabled = disable;
  });
}

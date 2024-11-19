GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxn2onZqiyTpulQTJsjSWgXDTJYN0bd9vKz4vjiiyMqKWlzRwCgggrM2dC1RZ_miroZBQ/exec'
// Global variable to store fetched people data
var peopleData = [];


document.addEventListener('DOMContentLoaded', function () {
	fetch(GOOGLE_SCRIPT_URL)
		.then(response => response.json())
		.then(data => {
			console.log('Fetched Data:', data);
			// Store the fetched data
			peopleData = data;
			// Sort the peopleData by firstName in Hebrew alphabetical order
			peopleData.sort(function (a, b) {
				return a.firstName.localeCompare(b.firstName, 'he');
			});
			// Populate the spouse, mother, and father dropdowns
			populateSpouseDropdown(peopleData);
			populateMotherDropdown(peopleData);
			populateFatherDropdown(peopleData);
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
});

function populateSpouseDropdown(people) {
	var spouseSelect = document.getElementById('spouseSelect');

	// Clear existing options except the first one
	spouseSelect.options.length = 1;

	people.forEach(function (person, index) {
		var option = document.createElement('option');
		option.value = index; // Use the index as the value
		option.text = `${person.firstName} ${person.lastName}`;
		spouseSelect.add(option);
	});
}

function populateMotherDropdown(people) {
	var motherSelect = document.getElementById('motherSelect');

	// Clear existing options except the first one
	motherSelect.options.length = 1;

	people.forEach(function (person, index) {
		var option = document.createElement('option');
		option.value = index; // Use the index as the value
		option.text = `${person.firstName} ${person.lastName}`;
		motherSelect.add(option);
	});
}

function populateFatherDropdown(people) {
	var fatherSelect = document.getElementById('fatherSelect');

	// Clear existing options except the first one
	fatherSelect.options.length = 1;

	people.forEach(function (person, index) {
		var option = document.createElement('option');
		option.value = index; // Use the index as the value
		option.text = `${person.firstName} ${person.lastName}`;
		fatherSelect.add(option);
	});
}

// Image preview functionality
document.getElementById('faceImage').addEventListener('change', function (event) {
	var reader = new FileReader();
	reader.onload = function () {
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
		document.getElementById('motherSelect').setAttribute('required', 'required');
		document.getElementById('fatherSelect').setAttribute('required', 'required');
		document.getElementById('spouseSelect').removeAttribute('required');
	} else {
		bloodYesFields.style.display = 'none';
		bloodNoFields.style.display = 'block';
		// Set required attributes
		document.getElementById('spouseSelect').setAttribute('required', 'required');
		document.getElementById('motherSelect').removeAttribute('required');
		document.getElementById('fatherSelect').removeAttribute('required');
	}
}

// Form submission handling
document.getElementById('familyForm').addEventListener('submit', function (e) {
	e.preventDefault();

	var form = e.target;

	// Collect data before disabling inputs
	var formData = new FormData(form);

	// Convert formData to a plain object
	var data = {};
	formData.forEach(function (value, key) {
		console.log(value);
		try {
			data[key] = value.trim();

		} catch (error) {
			data[key] = value
		}

	});

	// Map bloodConnection value from English to Hebrew
	if (data.bloodConnection === 'Yes') {
		data.bloodConnection = 'כן';
	} else if (data.bloodConnection === 'No') {
		data.bloodConnection = 'לא';
	}

	// If bloodConnection is 'לא' (No), handle spouse selection
	if (data.bloodConnection === 'לא' && data.spouseSelect) {
		var spouseIndex = data.spouseSelect;
		var spousePerson = peopleData[spouseIndex];

		if (spousePerson) {
			data.spouseFirstName = spousePerson.firstName;
			data.spouseLastName = spousePerson.lastName;
		} else {
			data.spouseFirstName = '';
			data.spouseLastName = '';
		}
	}

	// Remove spouseSelect from data since we now have spouseFirstName and spouseLastName
	delete data.spouseSelect;

	// If bloodConnection is 'כן' (Yes), handle mother and father selection
	if (data.bloodConnection === 'כן') {
		// Mother
		if (data.motherSelect) {
			var motherIndex = data.motherSelect;
			var motherPerson = peopleData[motherIndex];

			if (motherPerson) {
				data.motherFirstName = motherPerson.firstName;
			} else {
				data.motherFirstName = '';
			}
		}

		// Father
		if (data.fatherSelect) {
			var fatherIndex = data.fatherSelect;
			var fatherPerson = peopleData[fatherIndex];

			if (fatherPerson) {
				data.fatherFirstName = fatherPerson.firstName;
			} else {
				data.fatherFirstName = '';
			}
		}
	}

	// Remove motherSelect and fatherSelect from data since we now have motherFirstName and fatherFirstName
	delete data.motherSelect;
	delete data.fatherSelect;

	// Existing code to handle image and send data...

	var fileInput = document.getElementById('faceImage');
	var file = fileInput.files[0];

	if (file) {
		var reader = new FileReader();
		reader.onloadend = function () {
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
	inputs.forEach(function (input) {
		input.disabled = disable;
	});
}

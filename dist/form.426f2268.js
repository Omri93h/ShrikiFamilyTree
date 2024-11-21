// GOOGLE_SCRIPT_URL should be defined with your actual Google Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_2rPGK5vUbfcsErPny0hsP532IUaHFMyyZhldk12zneFEat_rWizd19--nZ5kU_aezw/exec";
// Global variable to store fetched people data
var peopleData = [];
document.addEventListener("DOMContentLoaded", function() {
    fetch(GOOGLE_SCRIPT_URL).then((response)=>response.json()).then((data)=>{
        console.log("Fetched Data:", data);
        // Store the fetched data
        peopleData = data;
        // Create the "Prefer not to say" option with empty first and last names
        const preferNotToSay = {
            id: 0,
            firstName: "",
            lastName: "",
            birthDate: "",
            deathDate: "",
            directPhotoUrl: "",
            bloodRelation: "",
            motherFirstName: "",
            motherLastName: "",
            fatherFirstName: "",
            fatherLastName: "",
            spouseFirstName: "",
            spouseLastName: ""
        };
        // Add "Prefer not to say" as the first element in the array
        peopleData.unshift(preferNotToSay);
        // Sort the peopleData by firstName in Hebrew alphabetical order, excluding the first element
        const sortedPeopleData = peopleData.slice(1).sort(function(a, b) {
            return a.firstName.localeCompare(b.firstName, "he");
        });
        // Combine "Prefer not to say" with the sorted data
        peopleData = [
            preferNotToSay,
            ...sortedPeopleData
        ];
        // Populate the spouse, mother, and father dropdowns
        populateSpouseDropdown(peopleData);
        populateMotherDropdown(peopleData);
        populateFatherDropdown(peopleData);
    }).catch((error)=>{
        console.error("Error fetching data:", error);
    });
});
/**
 * Populate the Spouse Dropdown
 */ function populateSpouseDropdown(people) {
    var spouseSelect = document.getElementById("spouseSelect");
    // Clear existing options except the first one
    spouseSelect.options.length = 1;
    people.forEach(function(person) {
        var option = document.createElement("option");
        option.value = person.id; // Use the person's id as the value
        if (person.id === 0) option.text = "<\u05DE\u05E2\u05D3\u05D9\u05E4/\u05D4 \u05DC\u05D0 \u05DC\u05E6\u05D9\u05D9\u05DF>"; // Display text for "Prefer not to say"
        else option.text = `${person.firstName} ${person.lastName}`;
        spouseSelect.add(option);
    });
}
/**
 * Populate the Mother Dropdown
 */ function populateMotherDropdown(people) {
    var motherSelect = document.getElementById("motherSelect");
    // Clear existing options except the first one
    motherSelect.options.length = 1;
    people.forEach(function(person) {
        var option = document.createElement("option");
        option.value = person.id; // Use the person's id as the value
        if (person.id === 0) option.text = "<\u05DE\u05E2\u05D3\u05D9\u05E4/\u05D4 \u05DC\u05D0 \u05DC\u05E6\u05D9\u05D9\u05DF>"; // Display text for "Prefer not to say"
        else option.text = `${person.firstName} ${person.lastName}`;
        motherSelect.add(option);
    });
}
/**
 * Populate the Father Dropdown
 */ function populateFatherDropdown(people) {
    var fatherSelect = document.getElementById("fatherSelect");
    // Clear existing options except the first one
    fatherSelect.options.length = 1;
    people.forEach(function(person) {
        var option = document.createElement("option");
        option.value = person.id; // Use the person's id as the value
        if (person.id === 0) option.text = "<\u05DE\u05E2\u05D3\u05D9\u05E4/\u05D4 \u05DC\u05D0 \u05DC\u05E6\u05D9\u05D9\u05DF>"; // Display text for "Prefer not to say"
        else option.text = `${person.firstName} ${person.lastName}`;
        fatherSelect.add(option);
    });
}
/**
 * Image preview functionality
 */ document.getElementById("faceImage").addEventListener("change", function(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var output = document.getElementById("thumbnail");
        output.src = reader.result;
        output.style.display = "block";
    };
    reader.readAsDataURL(event.target.files[0]);
});
/**
 * Conditional fields based on blood connection
 */ document.getElementById("bloodYes").addEventListener("change", toggleBloodFields);
document.getElementById("bloodNo").addEventListener("change", toggleBloodFields);
function toggleBloodFields() {
    var bloodYesFields = document.getElementById("bloodYesFields");
    var bloodNoFields = document.getElementById("bloodNoFields");
    var isBloodYes = document.getElementById("bloodYes").checked;
    if (isBloodYes) {
        bloodYesFields.style.display = "block";
        bloodNoFields.style.display = "none";
        // Set required attributes
        document.getElementById("motherSelect").setAttribute("required", "required");
        document.getElementById("fatherSelect").setAttribute("required", "required");
        document.getElementById("spouseSelect").removeAttribute("required");
    } else {
        bloodYesFields.style.display = "none";
        bloodNoFields.style.display = "block";
        // Set required attributes
        document.getElementById("spouseSelect").setAttribute("required", "required");
        document.getElementById("motherSelect").removeAttribute("required");
        document.getElementById("fatherSelect").removeAttribute("required");
    }
}
/**
 * Form submission handling
 */ document.getElementById("familyForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var form = e.target;
    // Collect data before disabling inputs
    var formData = new FormData(form);
    // Convert formData to a plain object
    var data = {};
    formData.forEach(function(value, key) {
        try {
            data[key] = value.trim();
        } catch (error) {
            data[key] = value;
        }
    });
    // Map bloodConnection value from English to Hebrew
    if (data.bloodConnection === "Yes") data.bloodConnection = "\u05DB\u05DF";
    else if (data.bloodConnection === "No") data.bloodConnection = "\u05DC\u05D0";
    // If bloodConnection is 'לא' (No), handle spouse selection
    if (data.bloodConnection === "\u05DC\u05D0") {
        if (data.spouseSelect !== undefined && data.spouseSelect !== null) {
            var spouseId = parseInt(data.spouseSelect, 10);
            if (spouseId === 0) {
                data.spouseFirstName = "";
                data.spouseLastName = "";
            } else {
                var spousePerson = peopleData.find((person)=>person.id === spouseId);
                if (spousePerson) {
                    data.spouseFirstName = spousePerson.firstName;
                    data.spouseLastName = spousePerson.lastName;
                } else {
                    data.spouseFirstName = "";
                    data.spouseLastName = "";
                }
            }
        }
    }
    // Remove spouseSelect from data since we now have spouseFirstName and spouseLastName
    delete data.spouseSelect;
    // If bloodConnection is 'כן' (Yes), handle mother and father selection
    if (data.bloodConnection === "\u05DB\u05DF") {
        // Handle Mother
        if (data.motherSelect !== undefined && data.motherSelect !== null) {
            var motherId = parseInt(data.motherSelect, 10);
            if (motherId === 0) {
                data.motherFirstName = "";
                data.motherLastName = "";
            } else {
                var motherPerson = peopleData.find((person)=>person.id === motherId);
                if (motherPerson) {
                    data.motherFirstName = motherPerson.firstName;
                    data.motherLastName = motherPerson.lastName;
                } else {
                    data.motherFirstName = "";
                    data.motherLastName = "";
                }
            }
        }
        // Handle Father
        if (data.fatherSelect !== undefined && data.fatherSelect !== null) {
            var fatherId = parseInt(data.fatherSelect, 10);
            if (fatherId === 0) {
                data.fatherFirstName = "";
                data.fatherLastName = "";
            } else {
                var fatherPerson = peopleData.find((person)=>person.id === fatherId);
                if (fatherPerson) {
                    data.fatherFirstName = fatherPerson.firstName;
                    data.fatherLastName = fatherPerson.lastName;
                } else {
                    data.fatherFirstName = "";
                    data.fatherLastName = "";
                }
            }
        }
    }
    // Remove motherSelect and fatherSelect from data since we now have motherFirstName and fatherFirstName
    delete data.motherSelect;
    delete data.fatherSelect;
    // Existing code to handle image and send data...
    var fileInput = document.getElementById("faceImage");
    var file = fileInput.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            // Remove data URL prefix to get only base64 string
            var base64String = reader.result.split(",")[1];
            data.faceImage = base64String;
            data.faceImageContentType = file.type;
            // Send data via fetch
            sendData(data, form);
        };
        reader.readAsDataURL(file);
    } else {
        // No image selected
        data.faceImage = "";
        data.faceImageContentType = "";
        // Send data via fetch
        sendData(data, form);
    }
});
/**
 * Send data to Google Script
 */ function sendData(data, form) {
    var submitButton = form.querySelector('button[type="submit"]');
    // Disable the submit button and form inputs
    submitButton.disabled = true;
    disableFormInputs(form, true);
    // Show the spinner
    showSpinner(true);
    fetch(GOOGLE_SCRIPT_URL, {
        redirect: "follow",
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        }
    }).then((response)=>response.json()).then((result)=>{
        // Hide the spinner
        showSpinner(false);
        if (result.status === "success") // Redirect to the success page
        window.location.href = "success.html";
        else {
            // Enable the submit button and form inputs
            submitButton.disabled = false;
            disableFormInputs(form, false);
            showError("\u05E9\u05D2\u05D9\u05D0\u05D4: " + result.message);
        }
    }).catch((error)=>{
        console.error("Error:", error);
        // Hide the spinner
        showSpinner(false);
        // Enable the submit button and form inputs
        submitButton.disabled = false;
        disableFormInputs(form, false);
        showError("\u05D0\u05D9\u05E8\u05E2\u05D4 \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD.");
    });
}
/**
 * Show error message
 */ function showError(message) {
    var form = document.getElementById("familyForm");
    var errorDiv = document.getElementById("errorDiv");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "errorDiv";
        errorDiv.className = "alert alert-danger text-center";
        form.insertBefore(errorDiv, form.firstChild);
    }
    errorDiv.innerText = message;
}
/**
 * Show or hide the spinner
 */ function showSpinner(show) {
    var spinner = document.getElementById("spinner");
    if (show) spinner.style.display = "block";
    else spinner.style.display = "none";
}
/**
 * Disable or enable form inputs
 */ function disableFormInputs(form, disable) {
    var inputs = form.querySelectorAll("input, select, textarea, button");
    inputs.forEach(function(input) {
        input.disabled = disable;
    });
}

//# sourceMappingURL=form.426f2268.js.map

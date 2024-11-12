// Add basic FamilyTree CSS manually
const style = document.createElement("style");
style.textContent = `
  #familytree .balkangraph-node { /* Basic FamilyTree node styling */
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);

// Function to calculate the age if the person is still alive
function getAge(birthDate) {
	const birth = new Date(birthDate);
	const today = new Date();

	let age = today.getUTCFullYear() - birth.getUTCFullYear();
	if (
		today.getUTCMonth() < birth.getUTCMonth() ||
		(today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())
	) {
		age--;
	}

	return age.toString(); // Return age as a string
}

// Function to get the lifespan in the format "birthYear-deathYear"
function getLifeSpan(birthDate, deathDate) {
	const birthYear = new Date(birthDate).getUTCFullYear();
	const deathYear = new Date(deathDate).getUTCFullYear();
	return `${birthYear} - ${deathYear}`; // Format as "birthYear-deathYear"
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("Initializing data fetch");
	document.getElementById("spinner").style.display = "block";

	const dataUrl =
		"https://script.google.com/macros/s/AKfycbxiDq8HBnd3RaL-CGWnOEKL8aensNv23kmeBxl7ihaBD73go0tyOmwYd74_dhLwbuZQbw/exec";

	fetch(dataUrl)
		.then((response) => {
			console.log(`Received response with status: ${response.status}`);
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log("Fetched data:", data);
			buildFamilyTree(data);
		})
		.catch((error) => {
			console.error("Fetch error:", error);
			// document.getElementById("spinner").style.display = "none";
		});
});

// Function to build spouse and child connections
function buildFamilyTree(data) {
	// document.getElementById("spinner").style.display = "none";

	// Assign a unique id for each person
	data.forEach((person, index) => {
		person.id = index + 1;
	});

	// Map the data to nodes for FamilyTree.js
	const nodes = data.map((person) => ({
		id: person.id,
		name: `${person.firstName} ${person.lastName}`,
		img: person.directPhotoUrl.replace(
			"https://drive.google.com/uc?export=view&id=",
			"https://drive.google.com/thumbnail?id="
		),
		pids: [], // Spouse connections
		mid: null, // Mother's ID
		fid: null, // Father's ID
		age: person.deathDate == "" ? "גיל: " + getAge(person.birthDate) : getLifeSpan(person.birthDate, person.deathDate),
	}));

	// Build spouse connections
	data.forEach((person) => {
		if (person.spouseFirstName && person.spouseLastName) {
			const spouse = data.find((p) => p.firstName === person.spouseFirstName && p.lastName === person.spouseLastName);
			if (spouse) {
				nodes[person.id - 1].pids.push(spouse.id); // Connect spouses
				nodes[spouse.id - 1].pids.push(person.id); // Ensure both sides are connected
			}
		}
	});

	// Build parent-child connections
	data.forEach((person) => {
		const node = nodes[person.id - 1];
		if (person.motherFirstName && person.fatherFirstName) {
			const mother = data.find((p) => p.firstName === person.motherFirstName);
			const father = data.find((p) => p.firstName === person.fatherFirstName);
			if (mother) node.mid = mother.id; // Connect mother
			if (father) node.fid = father.id; // Connect father
		}
	});

	console.log("Final nodes data with automated connections:", nodes);

	// Initialize FamilyTree.js
	new FamilyTree(document.getElementById("familytree"), {
		template: "john",
		dataSource: nodes,
		nodeBinding: {
			field_0: "name",
			field_1: "age",
			img_0: "img",
		},
		mouseScrool: FamilyTree.action.none,
		nodes: nodes,
		enableSearch: false,
		nodeMouseClick: false,
		partnerNodeSeparation: -119,
		levelSeparation: 60,
		minPartnerSeparation: 20,
		partnerChildrenSplitSeparation: -5,
		siblingSeparation: 110,
	});

	// Set an initial zoom level if on mobile
	if (window.innerWidth <= 600) {
		// Adjust the width threshold as needed
		family.setZoom(0.8); // Set a zoom level that works well on mobile
	} else {
		family.setZoom(1); // Use normal zoom for larger screens
	}
}

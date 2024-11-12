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

// Function to adjust dates to local time by adding the offset
function adjustToLocalTime(dateString) {
	const date = new Date(dateString);
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjusts to local time
	return date;
}

// Function to calculate the age if the person is still alive
function getAge(birthDate) {
	const birth = adjustToLocalTime(birthDate);
	const today = new Date();

	let age = today.getFullYear() - birth.getFullYear();
	if (
		today.getMonth() < birth.getMonth() ||
		(today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
	) {
		age--;
	}
	return age.toString();
}

// Function to get the lifespan in the format "birthYear - deathYear"
function getLifeSpan(birthDate, deathDate) {
	const birth = adjustToLocalTime(birthDate);
	const death = adjustToLocalTime(deathDate);

	const birthYear = birth.getFullYear();
	const deathYear = death.getFullYear();
	return `${birthYear} - ${deathYear}`;
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("Initializing data fetch");
	document.getElementById("spinner").style.display = "block";

	const dataUrl =
		"https://script.google.com/macros/s/AKfycbw0B39BCAg0-LR-81NwcCzS4_JACvMYd8Bg_HN3mBsyl37ZJ2zYgBm6ONA24RzqyGIkrg/exec";

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


}

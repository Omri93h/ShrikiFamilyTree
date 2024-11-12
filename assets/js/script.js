
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

document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing data fetch");
    document.getElementById("spinner").style.display = "block";

    const dataUrl = "https://script.google.com/macros/s/AKfycbzO2IRgFoPhFXYDXZij7H7NC5_dRlSzLAwki8s9DJoGToiVbRLFk9-NT8zEy24nqK63lA/exec";

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
            document.getElementById("spinner").style.display = "none";
        });
});

// Function to build spouse and child connections
function buildFamilyTree(data) {
    document.getElementById("spinner").style.display = "none";

    // Assign a unique id for each person
    data.forEach((person, index) => {
        person.id = index + 1;
    });

    // Map the data to nodes for FamilyTree.js
    const nodes = data.map((person) => ({
        id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        img: person.directPhotoUrl.replace("https://drive.google.com/uc?export=view&id=", "https://drive.google.com/thumbnail?id="),
        pids: [], // Spouse connections
        mid: null, // Mother's ID
        fid: null  // Father's ID
    }));

    // Build spouse connections
    data.forEach((person) => {
        if (person.spouseFirstName && person.spouseLastName) {
            const spouse = data.find(
                (p) => p.firstName === person.spouseFirstName && p.lastName === person.spouseLastName
            );
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
        dataSource: nodes,
        nodeBinding: {
            field_0: "name",
            img_0: "img"
        },
        mouseScrool: FamilyTree.action.none,
        nodes: nodes,
        enableSearch: false,
        nodeMouseClick: false,
        partnerNodeSeparation: -119,
        minPartnerSeparation: 10,
        levelSeparation: 85,
        minPartnerSeparation: 10,
        partnerChildrenSplitSeparation: 1,
        siblingSeparation: 100

    });
}

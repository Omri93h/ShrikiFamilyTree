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
    if (today.getMonth() < birth.getMonth() || today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) age--;
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
function buildParentConnections(data, nodes) {
    data.forEach((person)=>{
        const node = nodes[person.id - 1];
        const motherFirstName = person.motherFirstName.split(" ")[0];
        const fatherFirstName = person.fatherFirstName.split(" ")[0];
        if (motherFirstName && fatherFirstName) {
            // Find all potential mothers and fathers with matching first names
            const potentialMothers = data.filter((p)=>p.firstName === motherFirstName);
            const potentialFathers = data.filter((p)=>p.firstName === fatherFirstName);
            // Identify mother-father pairs that are spouses
            let mother = null;
            let father = null;
            for (let m of potentialMothers){
                for (let f of potentialFathers)// Check if the mother-father pair are spouses
                if (nodes[m.id - 1].pids.includes(f.id)) {
                    mother = m;
                    father = f;
                    break;
                }
                if (mother && father) break;
            }
            // Assign the mother and father IDs if a matching spouse pair is found
            if (mother) node.mid = mother.id;
            if (father) node.fid = father.id;
        }
    });
    // Sort children by birth date for each parent-child group
    data.forEach((person)=>{
        const motherFirstName = person.motherFirstName.split(" ")[0];
        const fatherFirstName = person.fatherFirstName.split(" ")[0];
        if (motherFirstName && fatherFirstName) {
            let children = data.filter((child)=>child.motherFirstName && child.motherFirstName.split(" ")[0] === motherFirstName && child.fatherFirstName && child.fatherFirstName.split(" ")[0] === fatherFirstName);
            children.sort((a, b)=>new Date(a.birthDate) - new Date(b.birthDate));
            // Update children in nodes by order of birth date
            children.forEach((child, index)=>{
                nodes[child.id - 1].siblingOrder = index;
            });
        }
    });
    // Reorder the nodes array based on sibling order for visualization
    nodes.sort((a, b)=>(a.siblingOrder || 0) - (b.siblingOrder || 0));
}
function buildSpouseConnections(data, nodes) {
    // Build spouse connections
    data.forEach((person)=>{
        if (person.spouseFirstName && person.spouseLastName) {
            const spouse = data.find((p)=>p.firstName === person.spouseFirstName && p.lastName === person.spouseLastName);
            if (spouse) {
                nodes[person.id - 1].pids.push(spouse.id); // Connect spouses
                nodes[spouse.id - 1].pids.push(person.id); // Ensure both sides are connected
            }
        }
    });
}
function buildNodes(data) {
    const nodes = data.map((person)=>({
            id: person.id,
            name: `${person.firstName} ${person.lastName}`,
            img: person.directPhotoUrl.replace("https://drive.google.com/uc?export=view&id=", "https://drive.google.com/thumbnail?id="),
            pids: [],
            mid: null,
            fid: null,
            age: person.deathDate == "" ? "\u05D2\u05D9\u05DC: " + getAge(person.birthDate) : getLifeSpan(person.birthDate, person.deathDate)
        }));
    return nodes;
}
document.addEventListener("DOMContentLoaded", ()=>{
    console.log("Initializing data fetch");
    document.getElementById("spinner").style.display = "block";
    const dataUrl = "https://script.google.com/macros/s/AKfycbxn2onZqiyTpulQTJsjSWgXDTJYN0bd9vKz4vjiiyMqKWlzRwCgggrM2dC1RZ_miroZBQ/exec";
    fetch(dataUrl).then((response)=>{
        console.log(`Received response with status: ${response.status}`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        return response.json();
    }).then((data)=>{
        console.log("Fetched data:", data);
        buildFamilyTree(data);
    }).catch((error)=>{
        console.error("Fetch error:", error);
        document.getElementById("spinner").style.display = "none";
    });
});
function buildFamilyTree(data) {
    document.getElementById("spinner").style.display = "none";
    // Assign a unique id for each person
    data.forEach((person, index)=>{
        person.id = index + 1;
    });
    // Map the data to nodes for FamilyTree.js
    const nodes = buildNodes(data);
    buildSpouseConnections(data, nodes);
    buildParentConnections(data, nodes);
    // temp hard coded fix - need to fix later!
    nodes[0]["pids"].pop();
    nodes[1]["pids"].pop();
    // Initialize FamilyTree.js with custom sibling spacing
    new FamilyTree(document.getElementById("tree"), {
        template: "john",
        dataSource: nodes,
        nodeBinding: {
            field_0: "name",
            field_1: "age",
            img_0: "img"
        },
        // mouseScrool: FamilyTree.action.none,
        nodes: nodes,
        enableSearch: false,
        nodeMouseClick: false,
        partnerNodeSeparation: 0,
        levelSeparation: 80,
        minPartnerSeparation: 10,
        siblingSeparation: 80
    });
    console.log("Final Nodes:", nodes);
}

//# sourceMappingURL=index.a6d2c788.js.map

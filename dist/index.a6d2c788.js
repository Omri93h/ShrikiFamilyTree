GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQSVPqHLgN2YjJzu9LsPZTAUCxyPl-I2IDxXewbEhJi2hr7VYRrBzskuyqpDUK6oEdSQ/exec";
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
        const motherFirstName = person.motherFirstName;
        const motherLastName = person.motherLastName;
        const fatherFirstName = person.fatherFirstName;
        const fatherLastName = person.fatherLastName;
        let mother = null;
        let father = null;
        // Handle Mother Connection
        if (motherFirstName && motherLastName) {
            // Find all potential mothers matching both first and last names
            const potentialMothers = data.filter((p)=>p.firstName === motherFirstName && p.lastName === motherLastName);
            if (potentialMothers.length === 1) mother = potentialMothers[0];
            else if (potentialMothers.length > 1) {
                // we currently choose the first connection that created (bandage fix)
                mother = potentialMothers[0];
                // If multiple mothers found, attempt to find one whose spouse is the father
                const potentialFathers = data.filter((p)=>p.firstName === fatherFirstName && p.lastName === fatherLastName);
                for (let m of potentialMothers){
                    for (let f of potentialFathers)if (nodes[m.id - 1].pids.includes(f.id) && nodes[f.id - 1].pids.includes(m.id)) {
                        mother = m;
                        father = f;
                        break;
                    }
                    if (mother) break;
                }
                if (!mother) console.warn(`Multiple mothers found for ${person.firstName} ${person.lastName}, but no spouse connection with the father.`);
            } else console.warn(`No mother found with name ${motherFirstName} ${motherLastName} for ${person.firstName} ${person.lastName}.`);
        }
        // Handle Father Connection
        if (fatherFirstName && fatherLastName && !father) {
            // Find all potential fathers matching both first and last names
            const potentialFathers = data.filter((p)=>p.firstName === fatherFirstName && p.lastName === fatherLastName);
            if (potentialFathers.length === 1) father = potentialFathers[0];
            else if (potentialFathers.length > 1) {
                // we currently choose the first connection that created (bandage fix)
                father = potentialFathers[0];
                // If multiple fathers found, attempt to find one whose spouse is the mother
                const potentialMothers = data.filter((p)=>p.firstName === motherFirstName && p.lastName === motherLastName);
                for (let f of potentialFathers){
                    for (let m of potentialMothers)if (nodes[f.id - 1].pids.includes(m.id) && nodes[m.id - 1].pids.includes(f.id)) {
                        father = f;
                        mother = m;
                        break;
                    }
                    if (father) break;
                }
                if (!father) console.warn(`Multiple fathers found for ${person.firstName} ${person.lastName}, but no spouse connection with the mother.`);
            } else console.warn(`No father found with name ${fatherFirstName} ${fatherLastName} for ${person.firstName} ${person.lastName}.`);
        }
        // Assign mother and father IDs if found
        if (mother) node.mid = mother.id;
        if (father) node.fid = father.id;
    });
    // Sort children by birth date for each parent-child group
    data.forEach((person)=>{
        const motherFirstName = person.motherFirstName;
        const motherLastName = person.motherLastName;
        const fatherFirstName = person.fatherFirstName;
        const fatherLastName = person.fatherLastName;
        if (motherFirstName && motherLastName && fatherFirstName && fatherLastName) {
            let children = data.filter((child)=>child.motherFirstName === motherFirstName && child.motherLastName === motherLastName && child.fatherFirstName === fatherFirstName && child.fatherLastName === fatherLastName);
            children.sort((a, b)=>new Date(a.birthDate) - new Date(b.birthDate));
            // Update children in nodes by order of birth date
            children.forEach((child, index)=>{
                nodes[child.id - 1].siblingOrder = index;
            });
        } else if (motherFirstName && motherLastName) {
            // Handle single mother
            let children = data.filter((child)=>child.motherFirstName === motherFirstName && child.motherLastName === motherLastName && (!child.fatherFirstName || !child.fatherLastName));
            children.sort((a, b)=>new Date(a.birthDate) - new Date(b.birthDate));
            children.forEach((child, index)=>{
                nodes[child.id - 1].siblingOrder = index;
            });
        } else if (fatherFirstName && fatherLastName) {
            // Handle single father
            let children = data.filter((child)=>child.fatherFirstName === fatherFirstName && child.fatherLastName === fatherLastName && (!child.motherFirstName || !child.motherLastName));
            children.sort((a, b)=>new Date(a.birthDate) - new Date(b.birthDate));
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
        const spouseFirstName = person.spouseFirstName;
        const spouseLastName = person.spouseLastName;
        if (spouseFirstName && spouseLastName) {
            // Find all potential spouses matching both first and last names
            const potentialSpouses = data.filter((p)=>p.firstName === spouseFirstName && p.lastName === spouseLastName);
            if (potentialSpouses.length === 1) {
                // Establish bidirectional spouse connections
                const spouse = potentialSpouses[0];
                nodes[person.id - 1].pids.push(spouse.id);
                nodes[spouse.id - 1].pids.push(person.id);
            } else if (potentialSpouses.length > 1) {
                console.warn(`Multiple spouses found with name ${spouseFirstName} ${spouseLastName} for ${person.firstName} ${person.lastName}. Spouse connection skipped.`);
                // we currently choose the first connection that created (bandage fix)
                const spouse = potentialSpouses[0];
                nodes[person.id - 1].pids.push(spouse.id);
                nodes[spouse.id - 1].pids.push(person.id);
            } else console.warn(`No spouse found with name ${spouseFirstName} ${spouseLastName} for ${person.firstName} ${person.lastName}.`);
        }
    });
}
document.addEventListener("DOMContentLoaded", ()=>{
    console.log("Initializing data fetch");
    document.getElementById("spinner").style.display = "block";
    fetch(GOOGLE_SCRIPT_URL).then((response)=>{
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
    // Initialize FamilyTree.js
    FamilyTree.templates.john.field_0 = `<text data-width="230" style="font-size: 16px;font-weight:bold;" fill="#2c3e50;" x="60" y="140" text-anchor="middle">{val}</text>`;
    FamilyTree.templates.john.field_1 = `<text data-width="150" style="font-size: 13px;" fill="#2c3e50;" x="60" y="160" text-anchor="middle">{val}</text>`;
    var family = new FamilyTree(document.getElementById("tree"), {
        template: "john",
        nodeBinding: {
            field_0: "name",
            field_1: "age",
            img_0: "img"
        },
        // mouseScrool: FamilyTree.action.none,
        enableSearch: true,
        nodeMouseClick: false,
        // partnerNodeSeparation: 30,
        levelSeparation: 150,
        minPartnerSeparation: 40,
        siblingSeparation: 70,
        subtreeSeparation: 100,
        scaleInitial: FamilyTree.match.height,
        padding: 40
    });
    family.load(nodes);
    console.log("Final Nodes:", nodes);
}

//# sourceMappingURL=index.a6d2c788.js.map

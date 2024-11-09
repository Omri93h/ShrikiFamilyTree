async function fetchFamilyData() {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzXrVgQZ_8Rnhm8EUi8oWthvKMlmnfIFQGRrBtUVedO8zjj8cV4JBDdSSlZJPbY50ZLxg/exec');
    const data = await response.json();
    buildFamilyTree(data);
}
  
function buildFamilyTree(data) {
    const svg = d3.select("svg"),
          width = +svg.attr("width").replace('%', '') * window.innerWidth / 100,
          height = +svg.attr("height");

    const treeLayout = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    // Clear any previous content in the SVG
    svg.selectAll("*").remove();

    // Set up group for centering the tree
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2 - 50}, 50)`);

    // Draw links between nodes
    g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .style("stroke", "#ccc")
        .style("stroke-width", 2);

    // Draw nodes and labels
    const nodes = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
        .attr("r", 10)
        .style("fill", "#2ecc71")
        .style("stroke", "#27ae60")
        .style("stroke-width", 2);

    nodes.append("text")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .text(d => d.data.name)
        .style("font-size", "14px")
        .style("fill", "#34495e");
}

  
  // Fetch and build the family tree
  fetchFamilyData();
  
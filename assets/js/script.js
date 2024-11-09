async function fetchFamilyData() {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzXrVgQZ_8Rnhm8EUi8oWthvKMlmnfIFQGRrBtUVedO8zjj8cV4JBDdSSlZJPbY50ZLxg/exec');
    const data = await response.json();
    buildFamilyTree(data);
}
  
  function buildFamilyTree(data) {
    const svg = d3.select("svg"),
          width = +svg.attr("width").replace('%', '') * window.innerWidth / 100,
          height = +svg.attr("height");
  
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([width - 160, height - 200]);
    treeLayout(root);
  
    // Draw links between nodes
    svg.selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("class", "link");
  
    // Draw nodes and labels
    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr("transform", d => `translate(${d.x},${d.y})`);
  
    nodes.append("circle").attr("r", 10).attr("class", "node");
    nodes.append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .text(d => d.data.name);
  }
  
  // Fetch and build the family tree
  fetchFamilyData();
  
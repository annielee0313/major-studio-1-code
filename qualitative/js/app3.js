// Import D3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Dataset URL
const datasetURL = "UpdatedOrchidData.json";

// Load data
d3.json(datasetURL).then(data => {
  // Filter data for euglossine bees
  const euglossineData = data.filter(d => d.pollinator_types === "Euglossine Bees");

  // Count occurrences of each fragrance type
  const fragranceCounts = d3.rollup(euglossineData, v => v.length, d => d.fragrance_types);
  
  // Convert the counts to an array
  const fragranceArray = Array.from(fragranceCounts, ([flavor, count]) => ({ flavor, count }));

  // Define the possible flavors based on the dataset
  const flavors = ["pleasant", "sweet", "earthy", "floral", "fruity", "spicy", "unpleasant"]; // Adjust based on actual fragrance types

  // Ensure all flavors are included even if count is zero
  const flavorCounts = flavors.map(flavor => {
    const count = fragranceArray.find(f => f.flavor === flavor)?.count || 0; // Default to 0 if not found
    return { flavor, count };
  });

  // Set the dimensions for the radar chart
  const svgWidth = 300, svgHeight = 300;
  const margin = { top: 50, right: 50, bottom: 40, left: 50 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Select or create SVG container for the radar chart
  const svg = d3.select("#radar-chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

  // Create the radial scale
  const radius = Math.min(width, height) / 2;
  const rScale = d3.scaleLinear()
    .range([0, radius])
    .domain([0, d3.max(flavorCounts, d => d.count)]);

  // Calculate the angle for each axis
  const angleSlice = Math.PI * 2 / flavors.length;

  // Function to compute the line path
  const line = d3.lineRadial()
    .angle((d, i) => i * angleSlice)
    .radius(d => d[0]);

  // Data for the radar chart
  const radarData = flavorCounts.map(d => [rScale(d.count), d.flavor]);

  // Append the radar path
  svg.append("path")
    .datum(radarData)
    .attr("d", line)
    .style("fill", "lightblue")
    .style("stroke", "blue")
    .style("stroke-width", "3px")
    .attr("fill-opacity", 0.6);

  // Create the axes
  const axis = svg.selectAll(".axis")
    .data(flavors)
    .enter()
    .append("g")
    .attr("class", "axis");

  // Append the lines for each axis
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => rScale(d3.max(flavorCounts, d => d.count)) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => rScale(d3.max(flavorCounts, d => d.count)) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("stroke", "#737373")
    .style("stroke-width", "2px");

  // Add labels
  axis.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", (d, i) => rScale(d3.max(flavorCounts, d => d.count) * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => rScale(d3.max(flavorCounts, d => d.count) * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
    .text(d => d);
});

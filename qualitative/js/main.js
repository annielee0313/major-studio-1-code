const fragranceTypes = {
    "pleasant": ["pleasant", "fragrant", "faint", "sometimes"],
    "sweet": ["honey", "sweet", "vanilla", "candy", "chocolate", "baby powder"],
    "earthy": ["rye bread", "almond", "eucalyptus", "anise", "wintergreen", "musty", "turpentine", "vegetable", "cheap cigars", "musky", "mushroom"],
    "floral": ["nasturtium", "narcissus", "gardenia", "floral", "lilies", "jasmine", "lily of the valley", "hyacinth", "lilac", "lilic"],
    "fruity": ["bananas", "peach", "apple", "citrus", "rose", "fruity", "oranges", "citronella", "coconut", "lemon"],
    "spicy": ["nutmeg", "anise", "mint", "spicy", "cinnamon", "clove", "licorice", "pepper", "peppermint", "minty"],
    "unpleasant": ["unpleasant", "foul", "rotten", "rotten waste", "rotten meat", "rancid cheese", "dental plaque", "fungus", "fetid", "fishy", "bitter"]
};

// Function to get the fragrance type from a note
function getFragranceType(note) {
    for (const [type, notes] of Object.entries(fragranceTypes)) {
        if (notes.includes(note.toLowerCase())) {
            return type; // Return the type if a match is found
        }
    }
    return null; // Return null if no match is found
}

// Set dimensions and margins of the graph
var margin = { top: 150, right: 100, bottom: 50, left: 100 }; 
var width = window.innerWidth - margin.left - margin.right; // Full width minus margins
var height = window.innerHeight - margin.top - margin.bottom; // Full height minus margins
var innerRadius = 90;
var outerRadius = Math.min(width, height) / 2; // Make outer radius half of the minimum dimension

// Create the SVG container
var svg = d3.select("#app4")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`); // Center the chart

// Define custom colors for each fragrance type
const colorMapping = {
  "pleasant": "#FFB76B",
  "sweet": "#FF92C1",
  "earthy": "#6D7D30",
  "floral": "#F6AFFA",
  "fruity": "#E2E846",
  "spicy": "#BC3D3D",
  "unpleasant": "#8E5C2B"
};

// Load your data from the JSON file
const datasetURL = "updatedOrchidData.json";
d3.json(datasetURL).then(data => {

  // Create a map to hold counts of unique fragrance notes across all entries, grouped by type
  const fragranceNoteCounts = new Map();

  // Process each data entry
  data.forEach(d => {
    if (d.fragrance_notes && d.fragrance_notes.length > 0) {
        // Split fragrance_notes into an array and exclude "fragrant"
        const notesArray = d.fragrance_notes.split(',').map(note => note.trim());

        notesArray.forEach(note => {
            if (note.toLowerCase() !== "fragrant") { // Exclude the generic "fragrant"
                const fragranceType = getFragranceType(note); // Get the fragrance type

                if (fragranceType) { // Only proceed if a valid type is found
                    // Initialize an entry for the fragrance note if not already present
                    if (!fragranceNoteCounts.has(note)) {
                        fragranceNoteCounts.set(note, { count: 0, fragranceType: fragranceType });
                    }

                    // Increment the count of the fragrance note
                    const noteData = fragranceNoteCounts.get(note);
                    noteData.count += 1;
                } else {
                    console.warn(`No fragrance type found for note: ${note}`);
                }
            }
        });
    }
});

// Convert the map into an array, grouped by fragrance type
const groupedData = {};
fragranceNoteCounts.forEach((data, note) => {
    const { fragranceType, count } = data;
    if (!groupedData[fragranceType]) {
        groupedData[fragranceType] = [];
    }
    groupedData[fragranceType].push({ note, count });
});

// Flatten the grouped data for visualization, maintaining order
const formattedData = [];
Object.keys(groupedData).forEach(type => {
    groupedData[type].forEach(item => {
        formattedData.push({ ...item, fragranceType: type });
    });
});

// Set up the scales
var x = d3.scaleBand()
    .range([0, 2 * Math.PI]) // X-axis goes all around the circle (0 to 2π)
    .align(0)
    .domain(formattedData.map(d => d.note)); // Use unique notes as the domain

var y = d3.scaleRadial()
    .range([innerRadius, outerRadius]) // Y-axis is radial (from inner to outer radius)
    .domain([0, d3.max(formattedData, d => d.count)]); // Domain is from 0 to the maximum count

// Add the bars
svg.append("g")
    .selectAll("path")
    .data(formattedData)
    .enter()
    .append("path")
      .attr("fill", d => colorMapping[d.fragranceType]) // Color by fragrance type
      .attr("d", d3.arc() // Create arc for each bar
          .innerRadius(innerRadius)
          .outerRadius(d => y(d.count)) // Height of the bar
          .startAngle(d => x(d.note)) // Start angle of the arc
          .endAngle(d => x(d.note) + x.bandwidth()) // End angle of the arc
          .padAngle(0.01)
          .padRadius(innerRadius)
      );

// Add labels to each bar
svg.append("g")
    .selectAll("g")
    .data(formattedData)
    .enter()
    .append("g")
      .attr("text-anchor", d => (x(d.note) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start")
      .attr("transform", d => "rotate(" + ((x(d.note) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d.count) + 10) + ",0)")
    .append("text")
      .text(d => d.note) // Label is the fragrance note
      .attr("transform", d => (x(d.note) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)")
      .style("font-size", "9px") // Smaller font size to avoid overlap
      .attr("alignment-baseline", "middle");

// Add a legend for fragrance types
const legend = svg.append("g")
    .attr("transform", `translate(${width / 2 - 100}, ${height / 2 + 200})`);
    
const types = Object.keys(colorMapping);
types.forEach((type, i) => {
    legend.append("rect")
        .attr("x", i * 100)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", colorMapping[type]);

    legend.append("text")
        .attr("x", i * 100 + 20)
        .attr("y", 10)
        .text(type)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
});
});


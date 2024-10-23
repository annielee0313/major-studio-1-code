let globalData = [];  // hold our dataset

let maxFragranceCounts = new Map(); // max count for each bar

const POLLINATOR_TYPES = [
    "All",
    "Euglossine Bees",
    "Other Bees",
    "Moth",
    "Wasp",
    "Fly",
    "Butterfly",
];

const fragranceTypes = {
    "pleasant": ["pleasant", "fragrant", "faint", "sometimes"],
    "sweet": ["honey", "sweet", "vanilla", "candy", "chocolate", "baby powder", "musky"],
    "earthy": ["rye bread", "almond", "eucalyptus", "anise", "wintergreen", "musty", "turpentine", "vegetable", "cheap cigars", "mushroom"],
    "floral": ["nasturtium", "narcissus", "gardenia", "rose", "floral", "lilies", "jasmine", "lily of the valley", "hyacinth", "lilac", "lilic"],
    "fruity": ["bananas", "peach", "apple", "citrus", "fruity", "oranges", "citronella", "coconut", "lemon"],
    "spicy": ["nutmeg", "anise", "mint", "spicy", "cinnamon", "clove", "licorice", "pepper", "peppermint", "minty"],
    "unpleasant": ["unpleasant", "foul", "rotten", "rotten waste", "rotten meat", "rancid cheese", "dental plaque", "fungus", "fetid", "fishy", "bitter"]
};

// Array to store selected fragrance notes
let selectedFragranceNotes = [];

// Create an array of unique fragrance types from the fragranceTypes object
const uniqueFragranceTypes = Object.keys(fragranceTypes);

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
var margin = { top: 300, right: 100, bottom: 100, left: 0 }; 
var width = window.innerWidth - margin.left - margin.right; // Full width minus margins
var height = window.innerHeight - margin.top - margin.bottom; // Full height minus margins
var innerRadius = 120;
var outerRadius = Math.min(width, height) / 1.5; // Make outer radius half of the minimum dimension

// Create the SVG container
var svg = d3.select("#app4")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`); // Center the chart

// Define custom colors for each fragrance type
const colorMapping = {
  "pleasant": "#FFB03B",
  "sweet": "#FF69AA",
  "earthy": "#8FA833",
  "floral": "#E785FF",
  "fruity": "#F6FF54",
  "spicy": "#E83939",
  "unpleasant": "#A5601B"
};

// Set up the scales globally
var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0);

var y = d3.scaleRadial()
    .range([innerRadius, outerRadius]);

// Define arc generator globally
const arcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => y(d.count))
    .startAngle(d => x(d.note))
    .endAngle(d => x(d.note) + x.bandwidth());

// Load your data from the JSON file
const datasetURL = "updatedOrchidData.json";
d3.json(datasetURL).then(data => {

  // Store data globally
  globalData = data;

  // Modify image URLs to include &max_w=90
  data.forEach(d => {
    if (d.image_url) {
      d.image_url = `${d.image_url}&max_w=90`;
    }
  });
  
  console.log(data); 
  
  // Split the data into two halves
  const midIndex = Math.ceil(data.length / 2);
  const firstHalf = data.slice(0, midIndex);
  const secondHalf = data.slice(midIndex);

  // tooltip for photo strip
  const imageTooltip2 = d3.select("body").append("div")
    .attr("class", "tooltip2")
    .style("opacity", 0); // Initially hidden

  // Populate the first photo strip
  const photoStrip1 = d3.select("#photo-strip-1");
    photoStrip1.selectAll("img")
        .data(firstHalf)
        .enter()
        .append("img")
        .attr("src", d => d.image_url)
        .attr("alt", d => d.common_name)
        .attr("data-fragrance-notes", d => d.fragrance_notes)
        .attr("data-pollinators", d => d.pollinator_types)

        .on("mouseover", function(event, d) {
            imageTooltip2.transition()
                .duration(200)
                .style("opacity", .9);
    
            imageTooltip2.html(`${d.common_name}<br>Fragrance: ${d.fragrance_notes}<br>Pollinator: ${d.pollinator_types}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            imageTooltip2.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            imageTooltip2.transition()
                .duration(500)
                .style("opacity", 0);
        });

    const photoStrip2 = d3.select("#photo-strip-2");
    photoStrip2.selectAll("img")
        .data(secondHalf)
        .enter()
        .append("img")
        .attr("src", d => d.image_url)
        .attr("alt", d => d.common_name)
        .attr("data-fragrance-notes", d => d.fragrance_notes)
        .attr("data-pollinators", d => d.pollinator_types)
        .on("mouseover", function(event, d) {
            imageTooltip2.transition()
                .duration(200)
                .style("opacity", .9);
    
            imageTooltip2.html(`${d.common_name}<br>Fragrance: ${d.fragrance_notes}<br>Pollinator: ${d.pollinator_types}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            imageTooltip2.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            imageTooltip2.transition()
                .duration(500)
                .style("opacity", 0);
        });


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

    createPollinatorButtons();
    
    // Add center count text if it doesn't exist
    if (!svg.select(".count-text").size()) {
        svg.append("text")
            .attr("class", "count-text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-family", "PPFranktionMono")
            .style("font-size", "14px")
            .style("fill", "white")
            .text(`count: ${data.length}`);
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

x.domain(formattedData.map(d => d.note));
y.domain([0, d3.max(formattedData, d => d.count)]);

// Function to adjust the brightness of a color
function brightenColor(color, factor) {
    // Convert hex color to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // Adjust brightness
    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));

    // Convert RGB back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Create a tooltip element
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip") // Add a class for styling
    .style("opacity", 0); // Initially hidden

/// Create the bars
    const bars = svg.append("g")
    .selectAll("path")
    .data(formattedData)
    .enter()
    .append("path")
    .attr("fill", d => colorMapping[d.fragranceType]) // Color by fragrance type
    .attr("d", arcGenerator) // Use the arc generator to create the bars
    .attr("data-original-color", d => colorMapping[d.fragranceType]) // Store original color

    .on("mouseover", function(event, d) {
        if (selectedFragranceNotes.length === 0) { // Only apply brightening if no bars are selected
            tooltip.transition()
                .duration(200)
                .style("opacity", .9); // Fade in the tooltip
            tooltip.html(`${d.note}: ${d.count}`) // Display note and count
                .style("left", (event.pageX + 5) + "px") // Position tooltip
                .style("top", (event.pageY - 28) + "px"); // Position tooltip
    
            // Increase brightness of the hovered bar
            const originalColor = d3.select(this).attr("data-original-color");
            d3.select(this).attr("fill", brightenColor(originalColor, 1.5)); // Brighten the color
    
            // Highlight images that match the fragrance note
            d3.selectAll("img").each(function() {
                const img = d3.select(this);
                const fragranceNotes = img.attr("data-fragrance-notes");
            });
        }
    })
    .on("mouseout", function() {
        if (selectedFragranceNotes.length === 0) { // Only reset color if no bars are selected
            tooltip.transition()
                .duration(500)
                .style("opacity", 0); // Fade out the tooltip
    
            // Reset the color of the bar using the stored original color
            const originalColor = d3.select(this).attr("data-original-color");
            d3.select(this).attr("fill", originalColor); // Restore original color
        }
    })
    .on("click", function(event, d) {
        const selectedNote = d.note.toLowerCase();
    
        // Check if the note is already selected
        const index = selectedFragranceNotes.indexOf(selectedNote);
        if (index > -1) {
            // Deselect the note if already selected
            selectedFragranceNotes.splice(index, 1);
        } else {
            // Select the note if not already selected
            selectedFragranceNotes.push(selectedNote);
        }
    
        // Update the photo strips based on the selected fragrance notes
        updatePhotoStrips(selectedFragranceNotes);
    
        if (selectedFragranceNotes.length > 0) {
            // Highlight the selected bars and reset their colors to the original
            d3.selectAll("path").attr("opacity", 0.5); // Dim all bars
            selectedFragranceNotes.forEach(note => {
                d3.selectAll("path")
                    .filter(d => d.note.toLowerCase() === note)
                    .attr("opacity", 1) // Highlight selected bars
                    .attr("fill", d => colorMapping[d.fragranceType]); // Restore original color of selected bars
            });
        } else {
            // No bars selected, so reset all bars' opacity and color back to the original
            d3.selectAll("path")
                .attr("opacity", 1) // Undim all bars
                .attr("fill", d => colorMapping[d.fragranceType]); // Restore original color
            resetPhotoStrips(); // Reset to original photo strip display
        }
    });
});

// Function to highlight images that match the fragrance note
function highlightMatchingImages(note, color) {
    d3.selectAll("img").each(function() {
        const img = d3.select(this);
        const fragranceNotes = img.attr("data-fragrance-notes");
    });
}
// Function to update the photo strips based on selected fragrance notes
function updatePhotoStrips(selectedNotes) {
    if (selectedNotes.length > 0) {
        // Get all images and filter based on the selected notes
        d3.select("#photo-strip-1").selectAll("img").style("display", function() {
            const fragranceNotes = d3.select(this).attr("data-fragrance-notes");
            return selectedNotes.some(note => fragranceNotes && fragranceNotes.includes(note)) ? "block" : "none";
        });

        d3.select("#photo-strip-2").selectAll("img").style("display", function() {
            const fragranceNotes = d3.select(this).attr("data-fragrance-notes");
            return selectedNotes.some(note => fragranceNotes && fragranceNotes.includes(note)) ? "block" : "none";
        });
    } else {
        resetPhotoStrips(); // Show all images if no notes are selected
    }
}

// Function to reset the photo strips to show all orchids
function resetPhotoStrips() {
    d3.select("#photo-strip-1").selectAll("img").style("display", "block");
    d3.select("#photo-strip-2").selectAll("img").style("display", "block");
}

// limit scroll
const photoStripContainer = document.getElementById('photo-strip-container');

photoStripContainer.addEventListener('scroll', function() {
    const maxScrollTop = this.scrollHeight - this.clientHeight; // Max scroll position
    if (this.scrollTop >= maxScrollTop) {
        // The user has reached the end of the scroll
        this.scrollTop = maxScrollTop; // Prevent further scrolling
    }
});

// Add this function after your existing function declarations
function createPollinatorButtons() {
    const buttonContainer = d3.select("#pollinator-buttons");
    
    buttonContainer.selectAll("button")
        .data(POLLINATOR_TYPES)
        .enter()
        .append("button")
        .attr("class", d => `pollinator-btn ${d === 'All' ? 'active' : ''}`)
        .text(d => d)
        .on("click", function(event, d) {
            // Update active button state
            d3.selectAll(".pollinator-btn").classed("active", false);
            d3.select(this).classed("active", true);
            
            // Update visualization
            updateVisualizationForPollinator(d);
        });
}

// calculate fragrance counts for pollinators
function calculateFragranceCounts(pollinatorType) {
    const counts = {};
    Object.keys(fragranceTypes).forEach(type => {
        counts[type] = 0;
    });

    const filteredData = pollinatorType === "All" 
        ? globalData 
        : globalData.filter(d => d.pollinator_types === pollinatorType);

    filteredData.forEach(d => {
        if (d.fragrance_notes) {
            const type = getFragranceType(d.fragrance_notes);
            if (type) counts[type]++;
        }
    });

    return Object.entries(counts).map(([type, count]) => ({
        fragranceType: type,
        count
    }));
}

function updateVisualizationForPollinator(pollinatorType) {
    // Filter data based on pollinator type
    const filteredData = pollinatorType === "All" 
        ? globalData 
        : globalData.filter(d => d.pollinator_types === pollinatorType);

    console.log(`Selected Pollinator: ${pollinatorType}`);
    console.log(`Total orchids for this pollinator: ${filteredData.length}`);
    console.log('Sample of matching orchids:', filteredData.slice(0, 5).map(d => ({
        name: d.common_name,
        pollinator: d.pollinator_types,
        fragrance: d.fragrance_notes,
        hasSpecificFragrance: d.fragrance_notes && d.fragrance_notes.toLowerCase() !== "fragrant"
    })));

    // Create a map to hold counts of fragrance notes for filtered data
    const fragranceNoteCounts = new Map();

    // Count orchids with specific fragrances (excluding those with only "fragrant")
    let orchidsWithSpecificFragrances = 0;

    // Process each filtered data entry
    filteredData.forEach(d => {
        if (d.fragrance_notes && d.fragrance_notes.length > 0) {
            const notesArray = d.fragrance_notes.split(',').map(note => note.trim());
            
            // Check if this orchid has any specific fragrance notes
            const hasSpecificNotes = notesArray.some(note => 
                note.toLowerCase() !== "fragrant" && getFragranceType(note)
            );
            
            if (hasSpecificNotes) {
                orchidsWithSpecificFragrances++;
                notesArray.forEach(note => {
                    if (note.toLowerCase() !== "fragrant") {
                        const fragranceType = getFragranceType(note);

                        if (fragranceType) {
                            if (!fragranceNoteCounts.has(note)) {
                                fragranceNoteCounts.set(note, { 
                                    count: 0, 
                                    fragranceType: fragranceType 
                                });
                            }
                            const noteData = fragranceNoteCounts.get(note);
                            noteData.count += 1;
                        }
                    }
                });
            }
        }
    });

    console.log(`Orchids with specific fragrances: ${orchidsWithSpecificFragrances}`);
    console.log('Fragrance distribution:', Object.fromEntries(fragranceNoteCounts));

    // If "All" is selected, update our maximum counts
    if (pollinatorType === "All") {
        maxFragranceCounts = new Map(fragranceNoteCounts);
    }

    // Convert to array format, using maxCounts for scaling
    const newData = Array.from(fragranceNoteCounts, ([note, data]) => ({
        note,
        count: data.count,
        maxCount: maxFragranceCounts.get(note)?.count || data.count,
        fragranceType: data.fragranceType,
        percentage: (data.count / orchidsWithSpecificFragrances * 100).toFixed(1)
    }));

    console.log('Final data for visualization:', newData);

    // Scale should always use the maximum counts from "All"
    y.domain([0, d3.max(Array.from(maxFragranceCounts.values()), d => d.count)]);

    // Update the bars with transition
    svg.selectAll("path")
        .data(newData, d => d.note)
        .transition()
        .duration(750)
        .attr("d", arcGenerator)
        .style("opacity", d => d.count === 0 ? 0.2 : 1)
        .attr("stroke", d => colorMapping[d.fragranceType])
        .attr("stroke-width", "2px");

    // Update center text to show both counts
    svg.select(".count-text")
        .text(`total: ${filteredData.length} (specific: ${orchidsWithSpecificFragrances})`);
}
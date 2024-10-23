let globalData = [];  // hold our dataset

let maxFragranceCounts = new Map(); // max count for each bar

let selectedPollinatorType = "All";  // Track current pollinator selection

let selectedFragranceNotes = []; // Array to store selected fragrance notes

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
        .attr("data-pollinator-type", d => d.pollinator_types) 
        .attr("data-fragrance-notes", d => d.fragrance_notes)  
        

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

    // populate photo strip 2
    const photoStrip2 = d3.select("#photo-strip-2");
photoStrip2.selectAll("img")
    .data(secondHalf)
    .enter()
    .append("img")
    .attr("src", d => d.image_url)
    .attr("alt", d => d.common_name)
    .attr("data-pollinator-type", d => d.pollinator_types) 
    .attr("data-fragrance-notes", d => d.fragrance_notes)  

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
        
    console.log("Checking first few images:");
    d3.selectAll("img").nodes().slice(0, 5).forEach(img => {
        console.log({
            fragranceNotes: img.getAttribute('data-fragrance-notes'),
            pollinatorType: img.getAttribute('data-pollinator-type')
        });
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
        
        // Toggle the selected note
        const index = selectedFragranceNotes.indexOf(selectedNote);
        if (index > -1) {
            selectedFragranceNotes.splice(index, 1);
        } else {
            selectedFragranceNotes.push(selectedNote);
        }
        
        // Update bar highlighting
        if (selectedFragranceNotes.length > 0) {
            d3.selectAll("path").attr("opacity", 0.5);
            selectedFragranceNotes.forEach(note => {
                d3.selectAll("path")
                    .filter(d => d.note.toLowerCase() === note)
                    .attr("opacity", 1)
                    .attr("fill", d => colorMapping[d.fragranceType]);
            });
        } else {
            d3.selectAll("path")
                .attr("opacity", 1)
                .attr("fill", d => colorMapping[d.fragranceType]);
        }
        
        // Update photo strips with both filters
        updatePhotoStrips(selectedFragranceNotes);
    });
});

function updatePhotoStrips(selectedNotes) {
    console.log("Filtering with:", {
        selectedPollinatorType,
        selectedNotes
    });

    const filterImages = function() {
        // Get the pollinator type and fragrance notes from the image
        const pollinatorType = this.getAttribute('data-pollinator-type');
        const fragranceNotes = this.getAttribute('data-fragrance-notes');

        console.log("Checking image:", {
            pollinatorType,
            fragranceNotes,
            selectedPollinatorType,
            matchesPollinator: selectedPollinatorType === "All" || 
                pollinatorType === selectedPollinatorType,
            matchesFragrance: selectedNotes.length === 0 || 
                selectedNotes.some(note => fragranceNotes.includes(note))
        });

        // Check if pollinator matches
        const matchesPollinator = selectedPollinatorType === "All" || 
            pollinatorType === selectedPollinatorType;

        // If no fragrance notes selected, just use pollinator match
        if (selectedNotes.length === 0) {
            return matchesPollinator;
        }

        // Check if any selected fragrance matches
        const matchesFragrance = selectedNotes.some(note => 
            fragranceNotes.includes(note.toLowerCase())
        );

        const shouldShow = matchesPollinator && matchesFragrance;
        if (shouldShow) {
            console.log("Found matching image:", {
                pollinatorType,
                fragranceNotes
            });
        }

        return shouldShow;
    };

    let matchCount = 0;
    ["#photo-strip-1", "#photo-strip-2"].forEach(stripId => {
        d3.select(stripId).selectAll("img")
            .style("display", function() {
                const shouldShow = filterImages.call(this);
                if (shouldShow) matchCount++;
                return shouldShow ? "block" : "none";
            });
    });

    console.log(`Total matches found: ${matchCount}`);
}

// Function to reset the photo strips to show all orchids
function resetPhotoStrips() {
    d3.select("#photo-strip-1").selectAll("img").style("display", "block");
    d3.select("#photo-strip-2").selectAll("img").style("display", "block");
}


// Create pollinator buttons
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
            
            // Update selected pollinator type
            selectedPollinatorType = d;
            
            // Reset fragrance selection
            selectedFragranceNotes = [];
            
            // Reset bar highlighting
            d3.selectAll("path")
                .attr("opacity", 1)
                .attr("fill", d => colorMapping[d.fragranceType]);
            
            // Update visualization with new pollinator
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

    // Store max counts when "All" is selected
    if (pollinatorType === "All") {
        // Calculate and store maximum counts for each note
        const allNoteCounts = new Map();
        globalData.forEach(d => {
            if (d.fragrance_notes) {
                const notesArray = d.fragrance_notes.toLowerCase().split(',')
                    .map(note => note.trim());
                
                notesArray.forEach(note => {
                    if (note !== "fragrant") {
                        const fragranceType = getFragranceType(note);
                        if (fragranceType) {
                            if (!allNoteCounts.has(note)) {
                                allNoteCounts.set(note, { 
                                    count: 0, 
                                    fragranceType: fragranceType 
                                });
                            }
                            const noteData = allNoteCounts.get(note);
                            noteData.count += 1;
                        }
                    }
                });
            }
        });
        maxFragranceCounts = allNoteCounts;
    }

    // Calculate current counts (for current pollinator selection)
    const currentNoteCounts = new Map();
    filteredData.forEach(d => {
        if (d.fragrance_notes) {
            const notesArray = d.fragrance_notes.toLowerCase().split(',')
                .map(note => note.trim());
            
            notesArray.forEach(note => {
                if (note !== "fragrant") {
                    const fragranceType = getFragranceType(note);
                    if (fragranceType) {
                        if (!currentNoteCounts.has(note)) {
                            currentNoteCounts.set(note, { 
                                count: 0, 
                                fragranceType: fragranceType 
                            });
                        }
                        const noteData = currentNoteCounts.get(note);
                        noteData.count += 1;
                    }
                }
            });
        }
    });

    // Create visualization data using ALL notes from maxFragranceCounts
    const newData = Array.from(maxFragranceCounts.entries()).map(([note, maxData]) => {
        const currentData = currentNoteCounts.get(note);
        return {
            note,
            count: currentData ? currentData.count : 0,  // Current count or 0 if none
            maxCount: maxData.count,  // Keep track of max count
            fragranceType: maxData.fragranceType
        };
    });

    // Scale using the maximum counts from "All" selection
    y.domain([0, d3.max(Array.from(maxFragranceCounts.values()), d => d.count)]);

    // Update visualization
    const bars = svg.selectAll("path")
        .data(newData, d => d.note);

    bars.transition()
        .duration(750)
        .attr("d", arcGenerator)
        .style("opacity", d => d.count === 0 ? 0.2 : 1)
}
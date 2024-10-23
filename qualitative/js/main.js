let globalData = [];  // hold our dataset
let maxFragranceCounts = new Map(); // max count for each bar
let selectedPollinatorType = "All";  // Track current pollinator selection
let selectedFragranceNotes = []; // Array to store selected fragrance notes
let currentFilteredCounts = new Map(); // store count for the tooltip

const POLLINATOR_TYPES = [
    "All",
    "Euglossine Bees",
    "Other Bees",
    "Moth",
    "Wasp",
    "Fly",
    // "Butterfly",
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

    //Modal
    const modal = document.getElementById('orchidModal');

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

  // Store data globally
  globalData = data;

  // Modify image URLs to include &max_w=200
  data.forEach(d => {
    if (d.image_url) {
      d.image_url = `${d.image_url}&max_w=200`;
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
        // Store pollinator types and fragrance notes as clean arrays
        .attr("data-pollinator-type", d => d.pollinator_types)
        .attr("data-fragrance-notes", d => {
            if (!d.fragrance_notes) return "";
            return d.fragrance_notes.toLowerCase();
        })
        .on("click", function(event, d) {
            // Update modal content
            modal.querySelector('.modal-image img').src = d.image_url;
            modal.querySelector('.modal-title').textContent = d.common_name;
            modal.querySelector('#pollination').textContent = `Pollination: ${d.pollination_syndrome}`;
            modal.querySelector('#fragrance').textContent = `Fragrance: ${d.fragrance}`;
            modal.querySelector('.modal-link').href = d.guid_link;
            
            // Show modal
            modal.style.display = "block";
        })
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

    // Populate the second photo strip - with the same updates
    const photoStrip2 = d3.select("#photo-strip-2");
    photoStrip2.selectAll("img")
        .data(secondHalf)
        .enter()
        .append("img")
        .attr("src", d => d.image_url)
        .attr("alt", d => d.common_name)
        .attr("data-pollinator-type", d => d.pollinator_types)
        .attr("data-fragrance-notes", d => {
            if (!d.fragrance_notes) return "";
            return d.fragrance_notes.toLowerCase();
        })
        .on("click", function(event, d) {
            // Update modal content
            modal.querySelector('.modal-image img').src = d.image_url;
            modal.querySelector('.modal-title').textContent = d.common_name;
            modal.querySelector('#pollination').textContent = `Pollination: ${d.pollination_syndrome}`;
            modal.querySelector('#fragrance').textContent = `Fragrance: ${d.fragrance}`;
            modal.querySelector('.modal-link').href = d.guid_link;
            
            // Show modal
            modal.style.display = "block";
        })
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
        // Get unique fragrance notes for this orchid
        const notesArray = [...new Set(d.fragrance_notes.toLowerCase()
            .split(',')
            .map(note => note.trim()))]
            .filter(note => note !== "" && note.toLowerCase() !== "fragrant");

        // Count each unique note only once per orchid
        notesArray.forEach(note => {
            const fragranceType = getFragranceType(note);
            if (fragranceType) {
                if (!fragranceNoteCounts.has(note)) {
                    fragranceNoteCounts.set(note, { 
                        count: 0, 
                        fragranceType: fragranceType,
                        orchids: new Set() // Track unique orchids with this note
                    });
                }
                // Add this orchid to the set for this note
                fragranceNoteCounts.get(note).orchids.add(d.guid_link); // Using guid_link as unique identifier
                fragranceNoteCounts.get(note).count = fragranceNoteCounts.get(note).orchids.size;
            } else {
                console.warn(`No fragrance type found for note: ${note}`);
            }
        });
    }


// Initialize currentFilteredCounts with the initial "All" state counts
currentFilteredCounts = new Map(
    Array.from(fragranceNoteCounts).map(([note, data]) => [
        note,
        {
            count: data.orchids.size,
            fragranceType: data.fragranceType,
            orchids: new Set(data.orchids)
        }
    ])
);
    
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
    .attr("fill", d => colorMapping[d.fragranceType])
    .attr("d", arcGenerator)
    .attr("data-original-color", d => colorMapping[d.fragranceType])
    .on("mouseover", function(event, d) {
        // Show tooltip regardless of selection state
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            
        const currentCount = currentFilteredCounts.get(d.note)?.count || 0;
        tooltip.html(`${d.note}: ${currentCount}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");

        // Only brighten if not selected
        if (!selectedFragranceNotes.includes(d.note.toLowerCase())) {
            const originalColor = d3.select(this).attr("data-original-color");
            d3.select(this).attr("fill", brightenColor(originalColor, 1.5));
        }
    })
    .on("mouseout", function(event, d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        // Only reset color if not selected
        if (!selectedFragranceNotes.includes(d.note.toLowerCase())) {
            const originalColor = d3.select(this).attr("data-original-color");
            d3.select(this).attr("fill", originalColor);
        }
    })
    .on("click", function(event, d) {
        event.stopPropagation(); // Prevent event bubbling
        
        const selectedNote = d.note.toLowerCase();
        
        // Hide tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        
        // Toggle selection
        const index = selectedFragranceNotes.indexOf(selectedNote);
        if (index > -1) {
            selectedFragranceNotes.splice(index, 1);
        } else {
            selectedFragranceNotes.push(selectedNote);
        }
        
        // Update all bars based on selection state
        svg.selectAll("path")
            .each(function(d) {
                if (!d || !d.note) return;
                
                const isSelected = selectedFragranceNotes.includes(d.note.toLowerCase());
                const path = d3.select(this);
                
                if (selectedFragranceNotes.length > 0) {
                    // If we have selections, dim unselected bars
                    if (isSelected) {
                        path
                            .attr("opacity", 1)
                            .attr("fill", colorMapping[d.fragranceType]);
                    } else {
                        path
                            .attr("opacity", 0.2)
                            .attr("fill", colorMapping[d.fragranceType]);
                    }
                } else {
                    // If no selections, reset all bars
                    path
                        .attr("opacity", 1)
                        .attr("fill", colorMapping[d.fragranceType]);
                }
            });
        
        // Update photo strips
        updatePhotoStrips(selectedFragranceNotes);
    });

     // ADD LABELS HERE - after bars creation
     const labelRadius = innerRadius - 18;
     const labelGroup = svg.append("g")
         .attr("class", "label-group");
 
     const labelSettings = [
         { type: "floral", angle: -45 },
         { type: "fruity", angle: -15 },
         { type: "sweet", angle: 172},
         { type: "pleasant", angle: 155 },
         { type: "unpleasant", angle: 130 },
         { type: "earthy", angle: 105 },
         { type: "spicy", angle: 75 }
     ];
 
     labelSettings.forEach(({type, angle}, i) => {
         const pathId = `labelPath${i}`;
         const angleRad = (angle * Math.PI) / 180;
         
         const path = labelGroup.append("path")
             .attr("id", pathId)
             .attr("d", d3.arc()
                 .innerRadius(labelRadius)
                 .outerRadius(labelRadius)
                 .startAngle(0)
                 .endAngle(2 * Math.PI)
             )
             .style("fill", "none")
             .style("stroke", "none");
 
         labelGroup.append("text")
             .append("textPath")
             .attr("href", `#${pathId}`)
             .attr("startOffset", `${((angle + 180) / 360) * 100}%`)
             .style("text-anchor", "middle")
             .style("alignment-baseline", "middle")
             .style("fill", colorMapping[type])
             .style("font-family", "PPFranktionMono")
             .style("font-size", "0.8rem")
             .text(type);
     });
});


function updatePhotoStrips(selectedNotes) {
    console.log("Filtering with:", {
        selectedPollinatorType,
        selectedNotes
    });

    const filterImages = function() {
        // Get and clean the pollinator types and fragrance notes
        const pollinatorTypes = this.getAttribute('data-pollinator-type')?.split(',').map(p => p.trim()) || [];
        const fragranceNotes = this.getAttribute('data-fragrance-notes')?.toLowerCase().split(',').map(n => n.trim()) || [];

        // Debug logging
        console.log("Checking image:", {
            pollinatorTypes,
            fragranceNotes,
            selectedPollinatorType
        });

        // Match if ANY of the orchid's pollinators match the selected type
        const matchesPollinator = selectedPollinatorType === "All" || 
            pollinatorTypes.includes(selectedPollinatorType);

        // If no fragrance notes selected, just use pollinator match
        if (!selectedNotes || selectedNotes.length === 0) {
            return matchesPollinator;
        }

        // Check if ANY selected fragrance matches ANY of the orchid's fragrances
        const matchesFragrance = selectedNotes.some(selectedNote => 
            fragranceNotes.some(orchidNote => orchidNote.includes(selectedNote))
        );

        const shouldShow = matchesPollinator && matchesFragrance;
        if (shouldShow) {
            console.log("Found matching image:", {
                pollinatorTypes,
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

    // Update the count text in the visualization
    svg.select(".count-text")
        .text(`count: ${matchCount}`);

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
        : globalData.filter(d => {
            const pollinators = d.pollinator_types.split(',').map(p => p.trim());
            return pollinators.includes(pollinatorType);
        });

    // Calculate current counts
    currentFilteredCounts = new Map();
    
    filteredData.forEach(d => {
        if (d.fragrance_notes) {
            const notes = [...new Set(d.fragrance_notes.toLowerCase()
                .split(',')
                .map(note => note.trim()))]
                .filter(note => note !== "" && note !== "fragrant");

            notes.forEach(note => {
                const fragranceType = getFragranceType(note);
                if (fragranceType) {
                    if (!currentFilteredCounts.has(note)) {
                        currentFilteredCounts.set(note, { 
                            count: 0, 
                            fragranceType,
                            orchids: new Set()
                        });
                    }
                    currentFilteredCounts.get(note).orchids.add(d.guid_link);
                    currentFilteredCounts.get(note).count = currentFilteredCounts.get(note).orchids.size;
                }
            });
        }
    });

    // Update the bars with smoother transitions
    const paths = svg.selectAll("path");
    
    // First update the data binding
    paths.each(function(d) {
        if (d && d.note) {
            d.prevCount = d.count || 0; // Store previous count
            d.count = currentFilteredCounts.get(d.note)?.count || 0; // Set new count
        }
    });

    // Then apply the transition
    paths.transition()
        .duration(750)
        .attrTween("d", function(d) {
            if (!d || !d.note) return;
            
            const startCount = d.prevCount || 0;
            const endCount = currentFilteredCounts.get(d.note)?.count || 0;
            
            return function(t) {
                const interpolatedCount = startCount + (endCount - startCount) * t;
                return arcGenerator({
                    ...d,
                    count: interpolatedCount
                });
            };
        })
        .style("opacity", d => {
            if (!d || !d.note) return 0.2;
            const count = currentFilteredCounts.get(d.note)?.count || 0;
            return count === 0 ? 0.2 : 1;
        });

    // Update center text
    svg.select(".count-text")
        .text(`count: ${filteredData.length}`);

    // Update photo strips
    updatePhotoStrips(selectedFragranceNotes);
}
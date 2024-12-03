let globalData = [];  // hold our dataset
let maxFragranceCounts = new Map(); // max count for each bar
let selectedPollinatorType = "All";  // Track current pollinator selection
let currentMonth = "January";  // Placeholder for month filter
let selectedFragranceNotes = []; // Array to store selected fragrance notes
let currentFilteredCounts = new Map(); // store count for the tooltip

let currentSimulation = null;


// Set up the SVG container for swatches
const swatchSize = 30;
const swatchPadding = 5;
const swatchWidth = getSpecSheetWidth();
const swatchHeight = swatchSize + (2 * swatchPadding);

let swatchSvg; 

// Add months array at the top level
const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


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

// get spec sheet width
function getSpecSheetWidth() {
    const specSheet = document.querySelector('.spec-sheet');
    return specSheet ? specSheet.clientWidth : 300;
}

// Set dimensions and margins of the graph
var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};

var width = getSpecSheetWidth();
var height = width; 
var innerRadius = width * 0.13; 
var outerRadius = width * 0.45; 

// Create the SVG container
var svg = d3.select("#app4")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);

// Initialize color swatch SVG
swatchSvg = d3.select("#app3")
    .append("svg")
    .attr("width", swatchWidth)
    .attr("height", swatchHeight)
    .append("g")
    .attr("transform", `translate(${swatchPadding}, ${swatchPadding})`);

// Make it responsive to window resizing
window.addEventListener('resize', function() {
    const newWidth = getSpecSheetWidth();
    const newHeight = newWidth;
    
    // Update SVG dimensions
    d3.select("#app4 svg")
        .attr("width", newWidth)
        .attr("height", newHeight);
        
    // Update transform
    d3.select("#app4 svg g")
        .attr("transform", `translate(${newWidth/2}, ${newHeight/2})`);
        
    // Update scales
    outerRadius = newWidth * 0.4;
    y.range([innerRadius, outerRadius]);
});

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
const datasetURL = "cleanedOrchidData.json";


d3.json(datasetURL).then(data => {

    //Modal
    const modal = document.getElementById('orchidModal');

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // Info modal functionality
    const infoIcon = document.getElementById('info-icon');
    const infoModal = document.getElementById('infoModal');

    if (infoIcon && infoModal) {
        infoIcon.addEventListener('click', function(event) {
            console.log('Icon clicked');
            event.stopPropagation();
            infoModal.style.display = "block";
        });

        infoModal.addEventListener('click', function() {
            console.log('Modal clicked - hiding');
            infoModal.style.display = "none";
        });
    }

    // Make sure modal is hidden initially
    if (infoModal) {
        infoModal.style.display = 'none';
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


// Create the bars
const bars = svg.append("g")
.selectAll("path")
.data(formattedData)
.enter()
.append("path")
.attr("class", "scent-bar")
.attr("fill", d => colorMapping[d.fragranceType])
.attr("d", arcGenerator)
.style("cursor", "pointer")
.on("mouseover", function(event, d) {
        // Brighten bar
        const bar = d3.select(this);
        const currentColor = colorMapping[d.fragranceType];
        bar.attr("fill", brightenColor(currentColor, 1.5));
        
        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
            
        const currentCount = currentFilteredCounts.get(d.note)?.count || 0;
        tooltip.html(`${d.note}: ${currentCount}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");

        // Highlight only visible matching bubbles
        d3.select('#app5')
            .selectAll('circle')
            .filter(orchid => 
                orchid.fragrance_notes && 
                orchid.fragrance_notes.toLowerCase().includes(d.note.toLowerCase()) &&
                d3.select(this).style('opacity') !== "0.2"  // Check if bubble is visible
            )
            .style("stroke", colorMapping[d.fragranceType])
            .style("stroke-width", "3px");
})

.on("mouseout", function(event, d) {
        // Reset bar color
        const bar = d3.select(this);
        bar.attr("fill", colorMapping[d.fragranceType]);
        
        // Hide tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        // Reset bubble borders
        d3.select('#app5')
            .selectAll('circle')
            .style("stroke", "#333")
            .style("stroke-width", "1px");
});
    

    // inner rim
    const staticData = formattedData.map(d => ({
            ...d,
            note: d.note,
            fragranceType: d.fragranceType
        }));

    const innerStructure = svg.append("g")
        .selectAll("path.inner-structure")
        .data(staticData)  // Use staticData instead of formattedData
        .enter()
        .append("path")
        .attr("class", "inner-structure")
        .attr("fill", "none")
        .attr("stroke", d => colorMapping[d.fragranceType])
        .attr("stroke-width", 0.8)
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(innerRadius + 0.8)
            .startAngle(d => x(d.note))
            .endAngle(d => x(d.note) + x.bandwidth())
        )
        .style("pointer-events", "none");

    //  // ADD LABELS HERE - after bars creation
    //  const labelRadius = innerRadius - 13;
    //  const labelGroup = svg.append("g")
    //      .attr("class", "label-group");
 
    //  const labelSettings = [
    //      { type: "floral", angle: -45 },
    //      { type: "fruity", angle: -15 },
    //      { type: "sweet", angle: 172},
    //      { type: "pleasant", angle: 155 },
    //      { type: "unpleasant", angle: 130 },
    //      { type: "earthy", angle: 105 },
    //      { type: "spicy", angle: 75 }
    //  ];
 
    //  labelSettings.forEach(({type, angle}, i) => {
    //      const pathId = `labelPath${i}`;
    //      const angleRad = (angle * Math.PI) / 180;
         
    //      const path = labelGroup.append("path")
    //          .attr("id", pathId)
    //          .attr("d", d3.arc()
    //              .innerRadius(labelRadius)
    //              .outerRadius(labelRadius)
    //              .startAngle(0)
    //              .endAngle(2 * Math.PI)
    //          )
    //          .style("fill", "none")
    //          .style("stroke", "none");
 
    //      labelGroup.append("text")
    //          .append("textPath")
    //          .attr("href", `#${pathId}`)
    //          .attr("startOffset", `${((angle + 180) / 360) * 100}%`)
    //          .style("text-anchor", "middle")
    //          .style("alignment-baseline", "middle")
    //          .style("fill", colorMapping[type])
    //          .style("font-family", "PPFranktionMono")
    //          .style("font-size", "0.8rem")
    //          .text(type);
    //  });

    updateColorSwatches(); // Initial call
});


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
            
            // Update visualization and title
            updateVisualizationForPollinator(d);
            updatePollinatorTitle(d);
        });

    // Initialize with "All" pollinator and first month
    updatePollinatorTitle("All");
    updateMonthTitle(months[0]);
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

    selectedFragranceNotes = []; 

    // Filter data based on pollinator type and current month
    const filteredData = globalData.filter(d => {
        const pollinatorMatch = pollinatorType === "All" 
            ? true 
            : d.pollinator_types.split(',').map(p => p.trim()).includes(pollinatorType);
        
        if (currentMonth === 'All') {
            return pollinatorMatch;
        } else {
            const monthIndex = months.indexOf(currentMonth);
            const monthMatch = d.cleaned_bloom_months.includes(monthIndex);
            return pollinatorMatch && monthMatch;
        }
    });

    // Calculate current counts for fragrance visualization
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

    // update color swatches
    updateColorSwatches();

    // Update the visualization with transitions
    const paths = svg.selectAll("path:not(.inner-structure)");
    
    paths.each(function(d) {
        if (d && d.note) {
            d.prevCount = d.count || 0;
            d.count = currentFilteredCounts.get(d.note)?.count || 0;
        }
    });

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

    // Update center text with filtered count
    svg.select(".count-text")
        .text(`count: ${filteredData.length}`);

        //bubble chart
        if (window.updateBubbleVisualization) {
            window.updateBubbleVisualization();
        }

        //update box plot
        if (window.updateBoxPlots) {
            window.updateBoxPlots();
        }
}

// Update pollinator name independently
function updatePollinatorTitle(pollinatorType) {
    const pollinatorElement = document.querySelector('.pollinator-name');
    const titleSuffix = document.querySelector('.title-suffix');
    
    if (!pollinatorElement || !titleSuffix) return;
    
    selectedPollinatorType = pollinatorType;
    
    if (pollinatorType === "All") {
        pollinatorElement.textContent = "All";
        titleSuffix.textContent = "Orchids in";
    } else {
        pollinatorElement.textContent = pollinatorType;
        titleSuffix.textContent = "Pollinated Orchids in";
    }
}

// Update month independently
function updateMonthTitle(month) {
    const monthElement = document.querySelector('.month-name');
    if (!monthElement) return;
    
    currentMonth = month;
    monthElement.textContent = month === 'All' ? 'All Months' : month;
}

// month-scale.js
const BAR_CONFIG = {
    containerWidth: 18, // Width in vw units
    minWidthPercent: 10, // Minimum width as percentage of containerWidth
    maxWidthPercent: 100 // Maximum width as percentage of containerWidth
};

function calculateBarWidth(count, totalOrchids) {
    // Normalize the count to a 0-1 scale
    const normalizedCount = count / totalOrchids;
    
    // Calculate width as a percentage of the container width
    const widthPercent = BAR_CONFIG.minWidthPercent + 
        (normalizedCount * (BAR_CONFIG.maxWidthPercent - BAR_CONFIG.minWidthPercent));
    
    // Convert to vw units
    return (widthPercent / 100 * BAR_CONFIG.containerWidth) + 'vw';
}

document.addEventListener("DOMContentLoaded", function () {
    const contentDiv = document.getElementById('content');
    const monthScale = document.getElementById('month-scale');
    const currentMonthIndicator = document.getElementById('current-month-indicator');
    const orchidCountDisplay = document.getElementById('orchid-count');
    
    // Create month scale
    months.forEach(month => {
        const monthLabel = document.createElement('div');
        monthLabel.textContent = month;
        monthScale.appendChild(monthLabel);

        const lineContainer = document.createElement('div');
        lineContainer.className = 'month-line';
        document.querySelector('.month-scale-container').appendChild(lineContainer);
    });

    // Load and process the data
    d3.json('cleanedOrchidData.json').then(data => {
        const totalOrchids = data.length;
        globalData = data; // Store data globally

        // Calculate counts for each month
        const monthCounts = months.map((month, idx) => {
            return data.filter(d => d.cleaned_bloom_months.includes(idx + 1)).length;
        });

        function updateChart(month) {
            if (month === currentMonth) return;
            selectedFragranceNotes = []; 
            currentMonth = month;
        
            let count;
            if (month === 'All') {
                // For "All", show total count
                count = totalOrchids;
                currentMonthIndicator.style.width = calculateBarWidth(count, totalOrchids);
            } else {
                // For specific months, show month count
                const monthIndex = months.indexOf(month) - 1; // Subtract 1 because 'All' shifts indices
                count = monthCounts[monthIndex];
                currentMonthIndicator.style.width = calculateBarWidth(count, totalOrchids);
            }
        
            // Update count display
            orchidCountDisplay.textContent = count;
        
            // Update month in title
            updateMonthTitle(month);
            
            // Update visualization
            updateVisualizationForPollinator(selectedPollinatorType);

            //bubble chart
            if (window.updateBubbleVisualization) {
                window.updateBubbleVisualization();
            }

            //update box plot
            if (window.updateBoxPlots) {
                window.updateBoxPlots();
            }
        }

        // Handle scroll
        contentDiv.addEventListener('scroll', () => {
            const scrollY = contentDiv.scrollTop;
            const viewportHeight = contentDiv.clientHeight;
            const totalHeight = contentDiv.scrollHeight - viewportHeight;
            
            // Add offset for "All" button
            const scrollRatio = scrollY / totalHeight;
            let monthIndex;
            
            if (scrollRatio < 0.05) { // First 5% of scroll shows "All"
                monthIndex = 0;
            } else {
                monthIndex = Math.floor(((scrollRatio - 0.05) / 0.95) * 12) + 1;
            }
            
            const clampedMonthIndex = Math.max(0, Math.min(12, monthIndex));
            
            // Update month indicator position
            const monthHeight = monthScale.clientHeight / 13; // 13 for All + 12 months
            const monthScaleTop = window.innerHeight / 2 - monthScale.clientHeight / 2;
            currentMonthIndicator.style.top = `${monthScaleTop + (clampedMonthIndex * monthHeight) + (monthHeight / 2)}px`;
            
            // Update current month
            updateChart(months[clampedMonthIndex]);
        });

        // Initialize with "All"
        updateChart('All');
    });
});


function updateColorSwatches() {
    const filteredData = globalData.filter(d => {
        const pollinatorMatch = selectedPollinatorType === "All" 
            ? true 
            : d.pollinator_types.split(',').map(p => p.trim()).includes(selectedPollinatorType);
        
        if (currentMonth === 'All') {
            return pollinatorMatch;
        } else {
            const monthIndex = months.indexOf(currentMonth);
            const monthMatch = d.cleaned_bloom_months.includes(monthIndex);
            return pollinatorMatch && monthMatch;
        }
    });

    // Clear and show loading text
    swatchSvg.selectAll("*").remove();
    swatchSvg.append("text")
        .attr("x", swatchWidth / 2)
        .attr("y", swatchSize / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("fill", "white")
        .style("font-family", "PPFranktionMono")
        .style("font-size", "0.8rem")
        .text("analyzing colors...");

    let allColors = [];
    let processed = 0;

    // Process all filtered data
    filteredData.forEach((d) => {
        if (d.image_url) {
            Vibrant.from(`${d.image_url}&max_w=200`).getPalette((err, palette) => {
                if (!err && palette) {
                    // Prioritize Vibrant and LightVibrant for flower colors
                    if (palette.Vibrant) allColors.push(palette.Vibrant.getHex());
                    if (palette.LightVibrant) allColors.push(palette.LightVibrant.getHex());
                    
                    // Add DarkVibrant only if it's not too dark
                    if (palette.DarkVibrant && 
                        palette.DarkVibrant.population > 0 &&
                        !isDark(palette.DarkVibrant.getHex())) {
                        allColors.push(palette.DarkVibrant.getHex());
                    }
                    
                    // Add Muted colors if they're bright enough
                    if (palette.Muted && 
                        palette.Muted.population > 5 &&
                        !isDark(palette.Muted.getHex())) {
                        allColors.push(palette.Muted.getHex());
                    }
                }
                
                processed++;
                if (processed === filteredData.length) {
                    displayColorSwatches(allColors);
                }
            });
        }
    });
}

function displayColorSwatches(colors) {
    // Function to check if a color is greenish (but allow yellows)
    function isGreenish(hexColor) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Allow yellows (high red and green, low blue)
        if (r > 150 && g > 150 && b < 100) return false;
        
        // Check for dominant green
        return g > Math.max(r, b) * 1.2;
    }

    // Function to check if color is too dark (background)
    function isDark(hexColor) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        return (r + g + b) / 3 < 40;
    }

    // Function to calculate color difference
    function getColorDifference(hex1, hex2) {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);
        
        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);

        return Math.sqrt(
            Math.pow(r1 - r2, 2) + 
            Math.pow(g1 - g2, 2) + 
            Math.pow(b1 - b2, 2)
        );
    }

    // Filter and count colors
    const colorCounts = colors
        .filter(color => !isDark(color) && !isGreenish(color))
        .reduce((acc, color) => {
            acc[color] = (acc[color] || 0) + 1;
            return acc;
        }, {});

    // Get distinct colors
    const distinctColors = Object.entries(colorCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .reduce((acc, [color]) => {
            const isDifferentEnough = acc.every(existingColor => 
                getColorDifference(color, existingColor) > 80
            );
            
            if (isDifferentEnough) {
                acc.push(color);
            }
            return acc;
        }, []);

    // Take first 6 distinct colors
    const uniqueColors = distinctColors.slice(0, 6);


    // Rest of your display code...
    swatchSvg.selectAll("*").remove();

    const totalWidth = uniqueColors.length * (swatchSize + swatchPadding);
    const startX = (swatchWidth - totalWidth) / 2;

    const swatches = swatchSvg.selectAll("rect")
        .data(uniqueColors)
        .enter()
        .append("g")
        .attr("transform", (d, i) => 
            `translate(${startX + (i * (swatchSize + swatchPadding))}, 0)`);

    swatches.append("rect")
        .attr("width", swatchSize)
        .attr("height", swatchSize)
        .attr("rx", 4)
        .style("fill", d => d)
        .style("stroke", "rgba(255,255,255,0.2)")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
}

// Bubble Chart
function createBubbleChart() {
    d3.select('#app5').selectAll('svg').remove();

    // Set up dimensions
    const width = document.querySelector('#app5').clientWidth;
    const height = document.querySelector('#app5').clientHeight;
    
    // Create SVG
    const svg = d3.select('#app5')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

    // Create image patterns for nodes
    function createImagePattern(d) {
        const patternId = `pattern-${d.guid_link.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        const defs = svg.append('defs');
        const pattern = defs.append('pattern')
            .attr('id', patternId)
            .attr('width', 1)
            .attr('height', 1)
            .attr('patternContentUnits', 'objectBoundingBox');

        pattern.append('image')
            .attr('xlink:href', `${d.image_url}&max_w=200`)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', 1)
            .attr('preserveAspectRatio', 'xMidYMid slice');

        return `url(#${patternId})`;
    }

    // Group data by genus and calculate positions
    const genusGroups = d3.group(globalData, d => d.taxonomic_names.Genus);
    const numGenera = genusGroups.size;
    const genusPositions = new Map(
        Array.from(genusGroups.keys()).map((genus, i) => {
            const angle = (i / numGenera) * 2 * Math.PI;
            return [
                genus, 
                {
                    x: Math.cos(angle) * width * 0.25,  // Wider horizontally
                    y: Math.sin(angle) * height * 0.12  // Less vertically
                }
            ];
        })
    );

    // Create nodes
    const nodes = svg.selectAll('circle')
        .data(globalData)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('fill', d => createImagePattern(d))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);

    // Set initial positions near genus centers
    globalData.forEach(d => {
        const center = genusPositions.get(d.taxonomic_names.Genus);
        if (center) {
            d.x = center.x + (Math.random() - 0.5) * 50;
            d.y = center.y + (Math.random() - 0.5) * 50;
        }
    });

    // Add hover effects
    nodes.on('mouseover', function(event, d) {
        // Only show tooltip if node is visible
        if (d3.select(this).style('opacity') < 1) return;

        d3.select(this)
            .raise()
            .transition()
            .duration(200)
            .attr('r', 100);

        d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
                <div style="font-family: PPFranktionMono; background: rgba(7,8,7,0.9); 
                           padding: 8px; border-radius: 4px; color: white;">
                    ${d.taxonomic_names.Genus} ${d.taxonomic_names.Species}<br>
                    ${d.fragrance_notes || 'No fragrance notes'}
                </div>
            `);
    })
    .on('mouseout', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 20);
        
        d3.selectAll('.tooltip').remove();
    });

    // Set up simulation
    const simulation = d3.forceSimulation(globalData)
        .force('charge', d3.forceManyBody().strength(-30))
        .force('collision', d3.forceCollide().radius(25))
        .force('x', d3.forceX().x(d => {
            const center = genusPositions.get(d.taxonomic_names.Genus);
            return center ? center.x : 0;
        }).strength(0.1))
        .force('y', d3.forceY().y(d => {
            const center = genusPositions.get(d.taxonomic_names.Genus);
            return center ? center.y : 0;
        }).strength(0.1))
        .velocityDecay(0.6);

    // Update node positions on simulation tick
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

    // Update function that matches the circular chart's filtering
    function updateVisualization() {
        // Get the same filtered data used for the count
        const filteredData = globalData.filter(d => {
            const pollinatorMatch = selectedPollinatorType === "All" 
                ? true 
                : d.pollinator_types.split(',').map(p => p.trim()).includes(selectedPollinatorType);
            
            if (currentMonth === 'All') {
                return pollinatorMatch;
            } else {
                const monthIndex = months.indexOf(currentMonth);
                const monthMatch = d.cleaned_bloom_months.includes(monthIndex);
                return pollinatorMatch && monthMatch;
            }
        });

        // Create set of visible IDs for efficient lookup
        const visibleIds = new Set(filteredData.map(d => d.guid_link));

        // Update node visibility
        nodes.transition()
            .duration(750)
            .style('opacity', d => visibleIds.has(d.guid_link) ? 1 : 0.2)
            .style('pointer-events', d => visibleIds.has(d.guid_link) ? 'all' : 'none');
    }

    // Store update function globally
    window.updateBubbleVisualization = updateVisualization;

    // Initial layout
    updateVisualization();
}

// Initialize when data is loaded
d3.json('cleanedOrchidData.json').then(data => {
    globalData = data;
    createBubbleChart();
    createFlowerCountPlot(); 
    createInflorescencePlot(); 
}).catch(error => {
    console.error("Error loading data:", error);
    d3.select('#app5').html("Error loading visualization");
});

// Handle window resize
window.addEventListener('resize', () => {
    createBubbleChart();
});

// Function to process numeric values from strings like "20-30"
function processNumericValue(value) {
    if (!value) return null;
    if (typeof value === 'number') return value;
    
    // Check if it's a range (e.g., "20-30")
    const parts = value.split('-');
    if (parts.length === 2) {
        const start = parseInt(parts[0]);
        const end = parseInt(parts[1]);
        if (!isNaN(start) && !isNaN(end)) {
            return (start + end) / 2;
        }
    }
    
    // Try parsing as a single number
    const num = parseInt(value);
    return isNaN(num) ? null : num;
}

// Create the flower count box plot
function createFlowerCountPlot() {
    
    // Clear existing content
    d3.select("#app1").selectAll("*").remove();
    
    // Set dimensions
    const width = 180;
    const height = 60;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    
    // Get filtered data based on current pollinator and month selection
    const filteredData = globalData.filter(d => {
        const pollinatorMatch = selectedPollinatorType === "All" 
            ? true 
            : d.pollinator_types.split(',').map(p => p.trim()).includes(selectedPollinatorType);
        
        if (currentMonth === 'All') {
            return pollinatorMatch;
        } else {
            const monthIndex = months.indexOf(currentMonth);
            const monthMatch = d.cleaned_bloom_months.includes(monthIndex);
            return pollinatorMatch && monthMatch;
        }
    });
    
    // Process the flower count data
    const values = filteredData
        .map(d => processNumericValue(d.flower_count))
        .filter(d => d !== null);
    
    if (values.length === 0) return;
    
    // Calculate statistics
    const sorted = values.sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const min = d3.min(sorted);
    const max = d3.max(sorted);
    
    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, max])
        .range([margin.left, width - margin.right]);
    
    // Create SVG
    const svg = d3.select("#app1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");
    
    // Add box
    svg.append("rect")
        .attr("x", xScale(q1))
        .attr("y", height/2 - 10)
        .attr("width", xScale(q3) - xScale(q1))
        .attr("height", 20)
        .attr("fill", "#BBFFB0")
        .attr("opacity", 0.5);
    
    // Add median line
    svg.append("line")
        .attr("x1", xScale(median))
        .attr("x2", xScale(median))
        .attr("y1", height/2 - 10)
        .attr("y2", height/2 + 10)
        .attr("stroke", "#BBFFB0")
        .attr("stroke-width", 2);
    
    // Add min line
    svg.append("line")
        .attr("x1", xScale(min))
        .attr("x2", xScale(min))
        .attr("y1", height/2 - 5)
        .attr("y2", height/2 + 5)
        .attr("stroke", "#BBFFB0");
    
    // Add max line
    svg.append("line")
        .attr("x1", xScale(max))
        .attr("x2", xScale(max))
        .attr("y1", height/2 - 5)
        .attr("y2", height/2 + 5)
        .attr("stroke", "#BBFFB0");
    
    // Add axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(0);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .style("font-family", "PPFranktionMono")
        .style("font-size", "10px")
        .style("color", "white");

    // Style axis
    svg.selectAll(".x-axis path")
        .style("stroke", "white");
    svg.selectAll(".x-axis text")
        .style("fill", "white");
}

// Create the inflorescence length box plot
function createInflorescencePlot() {
    // Clear existing content
    d3.select("#app2").selectAll("*").remove();
    
    // Set dimensions - same as flower count plot
    const width = 180;
    const height = 60;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    
    // Get filtered data based on current pollinator and month selection
    const filteredData = globalData.filter(d => {
        const pollinatorMatch = selectedPollinatorType === "All" 
            ? true 
            : d.pollinator_types.split(',').map(p => p.trim()).includes(selectedPollinatorType);
        
        if (currentMonth === 'All') {
            return pollinatorMatch;
        } else {
            const monthIndex = months.indexOf(currentMonth);
            const monthMatch = d.cleaned_bloom_months.includes(monthIndex);
            return pollinatorMatch && monthMatch;
        }
    });
    
    // Process the inflorescence length data
    const values = filteredData
        .map(d => {
            if (!d.inflorescence_length) return null;
            // Remove the inch symbol and process as a range
            const cleanValue = d.inflorescence_length.replace('"', '');
            return processNumericValue(cleanValue);
        })
        .filter(d => d !== null);
    
    if (values.length === 0) return;
    
    // Calculate statistics
    const sorted = values.sort(d3.ascending);
    const q1 = d3.quantile(sorted, 0.25);
    const median = d3.quantile(sorted, 0.5);
    const q3 = d3.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const min = d3.min(sorted);
    const max = d3.max(sorted);
    
    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, max])
        .range([margin.left, width - margin.right]);
    
    // Create SVG
    const svg = d3.select("#app2")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");
    
    // Add box
    svg.append("rect")
        .attr("x", xScale(q1))
        .attr("y", height/2 - 10)
        .attr("width", xScale(q3) - xScale(q1))
        .attr("height", 20)
        .attr("fill", "#BBFFB0")
        .attr("opacity", 0.5);
    
    // Add median line
    svg.append("line")
        .attr("x1", xScale(median))
        .attr("x2", xScale(median))
        .attr("y1", height/2 - 10)
        .attr("y2", height/2 + 10)
        .attr("stroke", "#BBFFB0")
        .attr("stroke-width", 2);
    
    // Add min line
    svg.append("line")
        .attr("x1", xScale(min))
        .attr("x2", xScale(min))
        .attr("y1", height/2 - 5)
        .attr("y2", height/2 + 5)
        .attr("stroke", "#BBFFB0");
    
    // Add max line
    svg.append("line")
        .attr("x1", xScale(max))
        .attr("x2", xScale(max))
        .attr("y1", height/2 - 5)
        .attr("y2", height/2 + 5)
        .attr("stroke", "#BBFFB0");
    
    // Add axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(0);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .style("font-family", "PPFranktionMono")
        .style("font-size", "10px")
        .style("color", "white");

    // Style axis
    svg.selectAll(".x-axis path")
        .style("stroke", "white");
    svg.selectAll(".x-axis text")
        .style("fill", "white");
}

// Initial creation
createFlowerCountPlot();
createInflorescencePlot();

// Update function to be called when pollinator or month changes
window.updateBoxPlots = function() {
    createFlowerCountPlot();
    createInflorescencePlot();
};



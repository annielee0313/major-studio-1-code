// Load your updatedOrchidData.json
d3.json('updatedOrchidData.json').then(function(data) {
    // Transform the data into the format needed for the Sankey diagram
    const sankeyData = transformDataForSankey(data);
    
    // Log transformed data for debugging
    console.log("Transformed Sankey Data:", sankeyData);
    
    // Only create the Sankey diagram if there are nodes and links
    if (sankeyData.nodes.length > 0 && sankeyData.links.length > 0) {
        createSankeyDiagram(sankeyData);
    } else {
        console.error("No nodes or links found to render the Sankey diagram.");
    }
}).catch(function(error) {
    console.error("Error loading the data:", error);
});

function transformDataForSankey(data) {
    let nodes = [];
    let links = [];
    const nodeMap = {}; // Keep track of node indices
    const maxPollinators = 8;
    const maxFragranceTypes = 7;

    // Define the desired fragrant times in a specific order
    const fragrantTimes = ['day_only', 'day_and_night', 'night_only'];

    // Track counts of pollinators and fragrance types
    const pollinatorCount = {};
    const fragranceTypeCount = {};

    // Helper function to add nodes and ensure they are unique
    function addNode(name) {
        if (!nodeMap[name]) {
            nodeMap[name] = nodes.length; // Store the index of the node
            nodes.push({ name }); // Add new node
        }
        return nodeMap[name]; // Return the index of the node
    }

    // Loop through each orchid entry and create nodes and links
    data.forEach(orchid => {
        const { fragrant_time, pollinator_types, fragrance_types } = orchid;

        // Count the fragrant_time
        if (fragrantTimes.includes(fragrant_time)) {
            // No need to add the fragrant time as a node yet
        }

        // Handle multiple pollinator types
        const pollinators = pollinator_types.split(',').map(p => p.trim()); // Split by comma
        pollinators.forEach(pollinator => {
            if (pollinator) {
                // Count pollinators
                pollinatorCount[pollinator] = (pollinatorCount[pollinator] || 0) + 1;
            }
        });

        // Handle multiple fragrance types
        const fragrances = fragrance_types.split(',').map(f => f.trim()); // Split by comma
        fragrances.forEach(fragrance => {
            if (fragrance) {
                // Count fragrance types
                fragranceTypeCount[fragrance] = (fragranceTypeCount[fragrance] || 0) + 1;
            }
        });
    });

    // Add fragrant_time nodes in the specified order
    fragrantTimes.forEach(time => addNode(time));

    // Sort and add pollinators by count
    const sortedPollinators = Object.entries(pollinatorCount)
        .sort(([, a], [, b]) => b - a) // Sort by descending count
        .slice(0, maxPollinators); // Limit to maxPollinators

    sortedPollinators.forEach(([pollinator]) => {
        addNode(pollinator); // Ensure pollinator is a node
    });

    // Sort and add fragrance types by count
    const sortedFragranceTypes = Object.entries(fragranceTypeCount)
        .sort(([, a], [, b]) => b - a) // Sort by descending count
        .slice(0, maxFragranceTypes); // Limit to maxFragranceTypes

    sortedFragranceTypes.forEach(([fragrance]) => {
        addNode(fragrance); // Ensure fragrance type is a node
    });

    // Create links based on the nodes added
    data.forEach(orchid => {
        const { fragrant_time, pollinator_types, fragrance_types } = orchid;

        // Only add links for valid fragrant_time nodes
        if (fragrantTimes.includes(fragrant_time)) {
            const fragrantTimeIndex = nodeMap[fragrant_time]; // Get index of fragrant time
            const pollinators = pollinator_types.split(',').map(p => p.trim());
            pollinators.forEach(pollinator => {
                const pollinatorIndex = nodeMap[pollinator]; // Get index of pollinator
                if (pollinatorIndex !== undefined) { // Check if the pollinator index is valid
                    links.push({ source: fragrantTimeIndex, target: pollinatorIndex, value: 1 }); // Link from fragrant time to pollinator
                }
            });
        }

        // Add links for pollinators to valid fragrance types only
        const fragrances = fragrance_types.split(',').map(f => f.trim());
        const validFragranceTypes = sortedFragranceTypes.map(([fragrance]) => fragrance); // Only use valid fragrance types

        const pollinators = pollinator_types.split(',').map(p => p.trim());
        fragrances.forEach(fragrance => {
            if (validFragranceTypes.includes(fragrance)) { // Ensure fragrance is valid
                const fragranceTypeIndex = nodeMap[fragrance]; // Get index of fragrance type
                pollinators.forEach(pollinator => {
                    const pollinatorIndex = nodeMap[pollinator]; // Get index of pollinator
                    if (pollinatorIndex !== undefined) { // Check if the pollinator index is valid
                        links.push({ source: pollinatorIndex, target: fragranceTypeIndex, value: 1 }); // Link from pollinator to fragrance type
                    }
                });
            }
        });
    });

    // Log nodes and links for debugging
    console.log("Nodes:", nodes);
    console.log("Links:", links);

    return { nodes, links };
}

function createSankeyDiagram(sankeyData) {
    // Set up SVG canvas for the Sankey diagram
    const svg = d3.select("#sankey-diagram")
        .attr("width", 800)
        .attr("height", 400);

    // Debugging output to check nodes and links
    console.log("Nodes for Sankey Diagram:", sankeyData.nodes);
    console.log("Links for Sankey Diagram:", sankeyData.links);

    // Color mapping for fragrance types
    const colorMapping = {
        pleasant: "#FFB76B",
        sweet: "#FF92C1",
        earthy: "#6D7D30",
        floral: "#FF9292",
        fruity: "#E2E846",
        spicy: "#BC3D3D",
        unpleasant: "#604D39",
        "Unknown Fragrance Type": "#ccc" // Default color for unknown types
    };

    // Specific color mapping for fragrant times
    const fragrantTimeColorMapping = {
        "day_only": "#94C6E6",
        "day_and_night": "#5B93B2",
        "night_only": "#36486D"
    };

    const sankey = d3.sankey()
        .nodeWidth(100) // Set the node width (you can adjust this value)
        .nodePadding(10)
        .extent([[1, 1], [800 - 1, 400 - 6]]);

    const { nodes, links } = sankey({
        nodes: sankeyData.nodes,  // Use the nodes directly
        links: sankeyData.links    // Use the links directly
    });

    // Debugging output to check after creating Sankey
    console.log("Processed Nodes:", nodes);
    console.log("Processed Links:", links);

    // Define linear gradients for the links
    const gradientDefs = svg.append("defs");

    // Create a gradient for each unique link type
    links.forEach((link, index) => {
        const gradientId = `link-gradient-${index}`;
        const gradient = gradientDefs.append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        // Safely access node names using the indices
        const colorStart = colorMapping[nodes[link.source]?.name] || "#ccc";  // Use optional chaining
        const colorEnd = colorMapping[nodes[link.target]?.name] || "#ccc";    // Use optional chaining

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", colorStart)
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", colorEnd)
            .attr("stop-opacity", 1);
    });

    // Draw links using the gradients
    svg.append("g")
        .selectAll("path")
        .data(links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("stroke", (d, i) => `url(#link-gradient-${i})`) // Use the gradient
        .on("click", function(event, d) {
            const sourceNode = nodes[d.source]?.name || "Unknown Source"; // Safely access name
            const targetNode = nodes[d.target]?.name || "Unknown Target"; // Safely access name
            console.log(`Clicked on link between ${sourceNode} and ${targetNode}`);
            displayOrchids(sourceNode, targetNode);
        });

    // Draw nodes
    svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => 
            fragrantTimeColorMapping[d.name] || 
            colorMapping[d.name] || "#ccc"
        )
        .append("title")
        .text(d => `${d.name}`);

    // Add node labels
    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-family", "Arial") // Change font family
        .style("font-size", "12px") // Change font size
        .text(d => d.name);
}

// Function to display orchids (you need to implement this)
function displayOrchids(sourceNode, targetNode) {
    console.log(`Displaying orchids for ${sourceNode} and ${targetNode}`);
}

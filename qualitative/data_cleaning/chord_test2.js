// Load the cleaned data from the existing data cleaning process
d3.json('cleanedData.json').then(data => {
    // Generalize the data (as shown previously)
    const pollinatorMap = {
        "bee": /bee/i,
        "moth": /moth/i,
        "fly": /fly/i,
        "wasp": /wasp/i,
        "beetle": /beetle/i,
        "self": /self/i
    };

    const fragranceMap = {
        "sweet": /sweet|honey|vanilla/i,
        "spicy": /spicy/i,
        "citrus": /citrus|lemon/i,
        "chocolate": /chocolate/i,
        "floral": /jasmine|lily/i,
        "mint": /mint/i,
        "unpleasant": /unpleasant|rotten|meat/i,
        "other": /.*/
    };

    // Generalize the data
    let cleanedData = data.map(orchid => {
        let generalizedPollinator = Object.keys(pollinatorMap).find(key => pollinatorMap[key].test(orchid.pollination_syndrome)) || 'other';
        let generalizedFragrance = Object.keys(fragranceMap).find(key => fragranceMap[key].test(orchid.fragrance)) || 'other';

        return {
            ...orchid,
            generalizedPollinator,
            generalizedFragrance
        };
    });

    // Create the chord matrix
    let pollinators = ['bee', 'moth', 'fly', 'wasp', 'beetle', 'self', 'other'];
    let fragrances = ['sweet', 'spicy', 'citrus', 'chocolate', 'floral', 'mint', 'unpleasant', 'other'];
    let matrix = Array(pollinators.length).fill(0).map(() => Array(fragrances.length).fill(0));

    // Populate the matrix based on generalized data
    cleanedData.forEach(orchid => {
        let pollinatorIndex = pollinators.indexOf(orchid.generalizedPollinator);
        let fragranceIndex = fragrances.indexOf(orchid.generalizedFragrance);
        if (pollinatorIndex >= 0 && fragranceIndex >= 0) {
            matrix[pollinatorIndex][fragranceIndex]++;
        }
    });

    // Setup dimensions and radius
    const width = 700;
    const height = 700;
    const radius = Math.min(width, height) / 2 - 40;

    // Create a color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create SVG
    const svg = d3.select("#chord-diagram").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Define the arc and chord functions
    const arc = d3.arc()
        .innerRadius(radius - 50)
        .outerRadius(radius - 20);

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    const chords = chord(matrix);

    // Draw pollinator arcs on the left
    const groupPollinators = svg.append("g")
        .selectAll("g")
        .data(chords.groups.slice(0, pollinators.length))
        .enter().append("g");

    groupPollinators.append("path")
        .style("fill", (d, i) => color(i))
        .style("stroke", d => d3.rgb(color(d.index)).darker())
        .attr("d", arc)
        .attr("transform", "rotate(90)"); // Rotate to position on the left

    // Draw fragrance arcs on the right
    const groupFragrances = svg.append("g")
        .selectAll("g")
        .data(chords.groups.slice(pollinators.length))
        .enter().append("g");

    groupFragrances.append("path")
        .style("fill", (d, i) => color(i + pollinators.length))
        .style("stroke", d => d3.rgb(color(d.index + pollinators.length)).darker())
        .attr("d", arc)
        .attr("transform", "rotate(-90)"); // Rotate to position on the right

    // Draw ribbons connecting pollinators to fragrances
    svg.append("g")
        .selectAll("path")
        .data(chords)
        .enter().append("path")
        .attr("d", d3.ribbon().radius(radius - 50))
        .style("fill", d => color(d.target.index))
        .style("opacity", 0.7);

    // Add labels for pollinators on the left
    svg.append("g")
        .selectAll("text")
        .data(chords.groups.slice(0, pollinators.length))
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", (d, i) => {
            const angle = (d.startAngle + d.endAngle) / 2;
            return `rotate(${angle * 180 / Math.PI - 90}) translate(${radius - 40})`; // Adjust position
        })
        .text((d, i) => pollinators[i]);

    // Add labels for fragrances on the right
    svg.append("g")
        .selectAll("text")
        .data(chords.groups.slice(pollinators.length))
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", (d, i) => {
            const angle = (d.startAngle + d.endAngle) / 2;
            return `rotate(${angle * 180 / Math.PI}) translate(${radius - 40})`; // Adjust position
        })
        .text((d, i) => fragrances[i]);
});

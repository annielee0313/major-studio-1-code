// Step 1: Fetch updatedOrchidData.json using fetch
fetch('./updatedOrchidData.json')
    .then(response => response.json())
    .then(orchids => {
        // Step 2: Define fragrance categories and their corresponding colors
        const colorMap = {
            pleasant: "#FFB76B",
            sweet: "#FF92C1",
            earthy: "#6D7D30",
            floral: "#FF9292",
            fruity: "#E2E846",
            spicy: "#BC3D3D",
            unpleasant: "#604D39"
        };

        // Step 3: Count occurrences of fragrance notes
        const noteCounts = {};
        const excludedWords = ["faint", "sometimes", "fragrant"]; // Words to exclude
        const noteTypeMap = {}; // To map notes to their fragrance type

        orchids.forEach(orchid => {
            const notes = orchid.fragrance_notes.split(', '); // Split by comma to get individual notes
            const types = orchid.fragrance_types.split(', '); // Get fragrance types

            notes.forEach(note => {
                note = note.trim().toLowerCase(); // Normalize to lower case and trim whitespace
                if (note && !excludedWords.includes(note)) { // Check if the note is not excluded
                    noteCounts[note] = (noteCounts[note] || 0) + 1; // Count occurrences
                    
                    // Map each note to its type
                    types.forEach(type => {
                        type = type.trim().toLowerCase(); // Normalize type
                        if (colorMap[type]) {
                            noteTypeMap[note] = type; // Store the type for the note
                        }
                    });
                }
            });
        });

        // Step 4: Prepare data for the word cloud
        const words = Object.entries(noteCounts).map(([note, count]) => {
            const type = noteTypeMap[note] || "pleasant"; // Default to "pleasant" if not found
            return {
                text: note, // Keep text in lowercase
                size: count // Set size as the raw count, scale it later
            };
        });

        // Step 5: Create a linear scale to map word counts to font sizes
        const fontSizeScale = d3.scaleLinear()
            .domain([d3.min(words, d => d.size), d3.max(words, d => d.size)]) // Input range (word counts)
            .range([10, 40]); // Output range (font sizes), 10 is min, 50 is max

        // Step 6: Create the word cloud layout
        const layout = d3.layout.cloud()
            .size([800, 400])
            .words(words)
            .padding(10)
            .rotate(0) // Set rotation to 0 for all text
            .fontSize(d => fontSizeScale(d.size)) // Set font size based on the scaled size
            .on("end", draw);

        layout.start();

        // Step 7: Draw the word cloud
        function draw(words) {
            d3.select("#word-cloud").selectAll("*").remove(); // Clear previous content
            const group = d3.select("#word-cloud").append("g")
                .attr("transform", "translate(400, 200)"); // Center the words

            // Append text elements
            group.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => d.size + "px")
                .style("fill", d => colorMap[noteTypeMap[d.text]] || "#000") // Use the color assigned in the words array
                .attr("class", "word-cloud-text")
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x}, ${d.y})`)
                .text(d => d.text.toLowerCase()); // Render text in lowercase
        }
    })
    .catch(error => console.error('Error fetching the data:', error));

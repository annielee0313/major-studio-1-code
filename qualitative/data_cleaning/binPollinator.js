// Step 1: Fetch extractedQualData.json using fetch
fetch('./extractedQualData.json')
    .then(response => response.json())
    .then(orchids => {

        // Step 2: Define pollinator categories with keywords
        const pollinatorCategories = {
            "Euglossine Bees": ["euglossine", "euplusia", "euglossa", "euglosside", "eulaema"],
            "Other Bees": ["bee", "bumblebee", "solitary bee", "apis mellifera", "bombus terrestris", "osmia bicornis"],  // General terms for other bees
            "Moth": ["moth", "sphinx moth", "hawk moth"],
            "Wasp": ["wasp", "yellowjacket", "hornet"],
            "Fly": ["fly", "blowfly", "flies"],
            "Butterfly": ["butterfly"],
            "Beetles": ["beetle", "carrion beetle"],
            "Others": []  // Catch-all for any other pollinators
        };

        // Step 3: Function to categorize pollinators
        const categorizePollinators = (pollinationText) => {
            if (!pollinationText) return { types: ['Unknown'] };

            const lowerPollination = pollinationText.toLowerCase();
            const identifiedPollinators = [];

            // Prioritize Euglossine Bees first
            const euglossineBees = pollinatorCategories["Euglossine Bees"].filter(bee => lowerPollination.includes(bee.toLowerCase()));
            if (euglossineBees.length > 0) {
                identifiedPollinators.push('Euglossine Bees');
            }

            // Check for Other Bees, but only if Euglossine Bees are not found
            if (euglossineBees.length === 0) {
                const otherBees = pollinatorCategories["Other Bees"].filter(bee => lowerPollination.includes(bee.toLowerCase()));
                if (otherBees.length > 0) {
                    identifiedPollinators.push('Other Bees');
                }
            }

            // Check for other pollinators, avoiding double categorization
            for (const [pollinator, keywords] of Object.entries(pollinatorCategories)) {
                if (pollinator !== "Euglossine Bees" && pollinator !== "Other Bees") {
                    // For Butterfly, avoid categorizing it as Fly
                    if (pollinator === "Butterfly" && lowerPollination.includes('butterfly')) {
                        identifiedPollinators.push("Butterfly");
                    } else if (pollinator === "Fly" && !lowerPollination.includes('butterfly')) {
                        const matchedKeywords = keywords.filter(keyword => lowerPollination.includes(keyword.toLowerCase()));
                        if (matchedKeywords.length > 0) {
                            identifiedPollinators.push(pollinator);  // Add category type to the array
                        }
                    } else if (pollinator !== "Fly" && pollinator !== "Butterfly") {
                        const matchedKeywords = keywords.filter(keyword => lowerPollination.includes(keyword.toLowerCase()));
                        if (matchedKeywords.length > 0) {
                            identifiedPollinators.push(pollinator);  // Add category type to the array
                        }
                    }
                }
            }

            // If no pollinators are identified, mark it as "Others"
            if (identifiedPollinators.length === 0) {
                identifiedPollinators.push('Others');
            }

            return {
                types: identifiedPollinators.length > 0 ? identifiedPollinators : ['Unknown']  // Return identified pollinators
            };
        };

        // Step 4: Iterate through the data, categorize and print results
        orchids.forEach((orchid, index) => {
            const pollination = orchid.pollination_syndrome || 'No pollination data';
            
            const { types: pollinatorTypes } = categorizePollinators(pollination);

            // Print the original pollination syndrome and the pollinator types
            console.log(`Orchid #${index + 1}:`);
            console.log(`  Original Pollination Syndrome: ${pollination}`);
            console.log(`  Pollinator Types: ${pollinatorTypes.join(', ') || 'None'}`);
        });

    })
    .catch(error => console.error('Error fetching the data:', error));

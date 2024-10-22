// Step 1: Fetch extractedQualData.json using fetch
fetch('./extractedQualData.json')
    .then(response => response.json())
    .then(orchids => {

        // Step 2: Define pollinator categories with keywords
        const pollinatorCategories = {
            "Euglossine Bees": ["euglossine", "euplusia", "euglossa", "euglosside", "eulaema"],
            "Other Bees": ["bee", "bumblebee", "solitary bee", "apis mellifera", "bombus terrestris", "osmia bicornis"],
            "Moth": ["moth", "sphinx moth", "hawk moth"],
            "Wasp": ["wasp", "yellowjacket", "hornet"],
            "Fly": ["fly", "blowfly", "flies"],
            "Butterfly": ["butterfly"],
            "Beetles": ["beetle", "carrion beetle"],
            "Others": []  // Catch-all for any other pollinators
        };

        // Step 3: Define fragrance categories with keywords
        const fragranceCategories = {
            "pleasant": ["pleasant", "fragrant", "faint", "sometimes"],
            "sweet": ["honey", "sweet", "vanilla", "candy", "chocolate", "baby powder"],
            "earthy": ["rye bread", "almond", "eucalyptus", "anise", "wintergreen", "musty", "turpentine", "vegetable", "cheap cigars", "musky", "mushroom"],
            "floral": ["nasturtium", "narcissus", "gardenia", "floral", "lilies", "jasmine", "lily of the valley", "hyacinth", "lilac", "lilic"],
            "fruity": ["bananas", "peach", "apple", "citrus", "rose", "fruity", "oranges", "citronella", "coconut", "lemon"],
            "spicy": ["nutmeg", "anise", "mint", "spicy", "cinnamon", "clove", "licorice", "pepper", "peppermint", "minty"],
            "unpleasant": ["unpleasant", "foul", "rotten", "rotten waste", "rotten meat", "rancid cheese", "dental plaque", "fungus", "fetid", "fishy", "bitter"]
        };

        // Step 4: Function to categorize pollinators
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
                    if (pollinator === "Butterfly" && lowerPollination.includes('butterfly')) {
                        identifiedPollinators.push("Butterfly");
                    } else if (pollinator === "Fly" && !lowerPollination.includes('butterfly')) {
                        const matchedKeywords = keywords.filter(keyword => lowerPollination.includes(keyword.toLowerCase()));
                        if (matchedKeywords.length > 0) {
                            identifiedPollinators.push(pollinator);
                        }
                    } else if (pollinator !== "Fly" && pollinator !== "Butterfly") {
                        const matchedKeywords = keywords.filter(keyword => lowerPollination.includes(keyword.toLowerCase()));
                        if (matchedKeywords.length > 0) {
                            identifiedPollinators.push(pollinator);
                        }
                    }
                }
            }

            // If no pollinators are identified, mark it as "Others"
            if (identifiedPollinators.length === 0) {
                identifiedPollinators.push('Others');
            }

            return {
                types: identifiedPollinators.length > 0 ? identifiedPollinators : ['Unknown']
            };
        };

        // Step 5: Function to identify fragrance strength
        const fragranceStrengthBins = (fragranceText) => {
            if (!fragranceText) return 'Unknown';
            
            const lowerFragrance = fragranceText.toLowerCase();
            if (lowerFragrance.includes('strong') || lowerFragrance.includes('highly fragrant') || lowerFragrance.includes('very')) {
                return 'Strong';
            } else if (lowerFragrance.includes('mild') || lowerFragrance.includes('sometimes')) {
                return 'Mild';
            } else if (lowerFragrance.includes('faint') || lowerFragrance.includes('slightly') || lowerFragrance.includes('slight') || lowerFragrance.includes('short time')) {
                return 'Slight';
            } else {
                return 'Unknown';
            }
        };

        // Step 6: Function to categorize fragrance types and list fragrance notes
        const categorizeFragrance = (fragranceText) => {
            if (!fragranceText) return { types: ['Unknown'], notes: [] };

            const lowerFragrance = fragranceText.toLowerCase();
            const identifiedTypes = [];
            let identifiedNotes = [];

            // Check for 'unpleasant' first
            if (lowerFragrance.includes('unpleasant')) {
                identifiedTypes.push('unpleasant');
                return { types: identifiedTypes, notes: [] };
            }

            // Loop through each category and its keywords
            for (const [category, keywords] of Object.entries(fragranceCategories)) {
                const matchedKeywords = keywords.filter(keyword => lowerFragrance.includes(keyword));
                if (matchedKeywords.length > 0) {
                    identifiedTypes.push(category);
                    identifiedNotes.push(...matchedKeywords);
                }
            }

            return {
                types: identifiedTypes,
                notes: identifiedNotes
            };
        };

        // Step 7: Function to determine fragrant time
        const determineFragrantTime = (fragranceText) => {
            if (!fragranceText) return 'day_and_night';

            const lowerFragrance = fragranceText.toLowerCase();
            if (lowerFragrance.includes('day') || lowerFragrance.includes('sun')) {
                return 'day_only';
            } else if (lowerFragrance.includes('night') || lowerFragrance.includes('afternoon')) {
                return 'night_only';
            } else {
                return 'day_and_night';
            }
        };

        // Step 8: Create a new array that merges the original data with the new categorized fields
        const updatedOrchidData = orchids.map((orchid) => {
            const pollination = orchid.pollination_syndrome || 'No pollination data';
            const fragrance = orchid.fragrance || 'No fragrance data';

            // Categorize pollinators
            const { types: pollinatorTypes } = categorizePollinators(pollination);

            // Categorize fragrance
            const fragranceStrength = fragranceStrengthBins(fragrance);
            const { types: fragranceTypes, notes: fragranceNotes } = categorizeFragrance(fragrance);
            const fragrantTime = determineFragrantTime(fragrance);

            // Return the original fields along with the new fields
            return {
                ...orchid,  // Include all original fields
                original_pollination_syndrome: pollination,
                pollinator_types: pollinatorTypes.join(', '),
                original_fragrance: fragrance,
                fragrance_strength: fragranceStrength,
                fragrance_types: fragranceTypes.join(', '),
                fragrance_notes: fragranceNotes.join(', '),
                fragrant_time: fragrantTime
            };
        });

        // Step 9: Create and download the updated JSON file with both original and new fields
        const blob = new Blob([JSON.stringify(updatedOrchidData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'updatedOrchidData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    })
    .catch(error => console.error('Error fetching the data:', error));

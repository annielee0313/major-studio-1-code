// Step 1: Fetch extractedQualData.json using fetch
fetch('./extractedQualData.json')
    .then(response => response.json())
    .then(orchids => {

        // Step 2: Define fragrance categories with keywords
        const fragranceCategories = {
            "pleasant": ["pleasant", "fragrant"],
            "sweet": ["sweet", "vanilla", "candy", "chocolate", "baby powder"],
            "earthy": ["rye bread", "almond", "eucalyptus", "anise", "wintergreen", "musty", "turpentine", "vegetable", "cheap cigars"],
            "floral": ["nasturtium", "narcissus", "gardenia", "floral", "lilies", "jasmine", "lily of the valley", "hyacinth", "lilac"],
            "fruity": ["bananas", "peach", "apple", "citrus", "rose", "fruity", "oranges", "citronella", "coconut"],
            "spicy": ["nutmeg", "anise", "mint", "spicy", "cinnamon", "clove", "licorice", "pepper", "peppermint", "minty"],
            "unpleasant": ["unpleasant", "foul", "rotten", "rotten waste", "rotten meat", "rancid cheese", "dental plaque", "fungus", "fetid", "fishy", "bitter"]
        };

        // Step 3: Function to identify fragrance strength
        const fragranceStrengthBins = (fragranceText) => {
            if (!fragranceText) return 'Unknown';
            
            const lowerFragrance = fragranceText.toLowerCase();
            if (lowerFragrance.includes('strong') || lowerFragrance.includes('highly frangrant') || lowerFragrance.includes('very')) {
                return 'Strong';
            } else if (lowerFragrance.includes('mild') || lowerFragrance.includes('sometimes')) {
                return 'Mild';
            } else if (lowerFragrance.includes('faint') || lowerFragrance.includes('slightly') || lowerFragrance.includes('slight') || lowerFragrance.includes('short time')) {
                return 'Slight';
            } else {
                return 'Unknown';
            }
        };

        // Step 4: Function to categorize fragrance types and list fragrance notes
        const categorizeFragrance = (fragranceText) => {
            if (!fragranceText) return { types: ['Unknown'], notes: [] };

            const lowerFragrance = fragranceText.toLowerCase();
            const identifiedTypes = []; // Array to collect all identified types
            let identifiedNotes = [];

            // Check for 'unpleasant' first
            if (lowerFragrance.includes('unpleasant')) {
                identifiedTypes.push('unpleasant'); // Only add 'unpleasant'
                return { types: identifiedTypes, notes: [] }; // Return immediately
            }

            // Loop through each category and its keywords
            for (const [category, keywords] of Object.entries(fragranceCategories)) {
                const matchedKeywords = keywords.filter(keyword => lowerFragrance.includes(keyword));
                if (matchedKeywords.length > 0) {
                    identifiedTypes.push(category);  // Add category type to the array
                    identifiedNotes.push(...matchedKeywords);  // Collect the matched keywords (fragrance notes)
                }
            }


            return {
                types: identifiedTypes,  // Fragrance types (array of types)
                notes: identifiedNotes  // Fragrance notes (specific keywords found)
            };
        };

        // Step 5: Function to determine fragrant time
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

        // Step 6: Iterate through the data, categorize and print results
        orchids.forEach((orchid, index) => {
            const fragrance = orchid.fragrance || 'No fragrance data';
            const fragranceStrength = fragranceStrengthBins(fragrance);
            const { types: fragranceTypes, notes: fragranceNotes } = categorizeFragrance(fragrance);
            const fragrantTime = determineFragrantTime(fragrance);

            // Print the original fragrance, categorized types, notes, and strength
            console.log(`Orchid #${index + 1}:`);
            console.log(`  Original Fragrance: ${fragrance}`);
            console.log(`  Fragrance Strength: ${fragranceStrength}`);
            console.log(`  Fragrance Types: ${fragranceTypes.join(', ') || 'None'}`);
            console.log(`  Fragrance Notes: ${fragranceNotes.join(', ') || 'None'}`);
            console.log(`  Fragrant Time: ${fragrantTime}`);
        });

    })
    .catch(error => console.error('Error fetching the data:', error));

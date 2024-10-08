// Define your API key and base URL
const apiKey = "RLaXwT4AAXNEi9zDr6nd9cytOb4iWfhAl40ugta1";
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Function to trigger download of JSON data as a file
function downloadJSON(data, filename = 'extractedData.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
}

// Function to fetch data from the API
function fetchAllData(searchTerm, numRows = 500) {
    // Construct the URL for the API request
    let url = `${searchBaseURL}?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&rows=${numRows}`;
    console.log("Fetching data from:", url); // Log the URL for debugging

    // Fetch data from the API
    fetch(url)
        .then(res => res.json()) // Parse the response as JSON
        .then(data => {
            console.log("API Response:", data); // Log the entire API response for debugging

            if (!data.response || !Array.isArray(data.response.rows)) {
                console.error("Invalid data structure");
                return;
            }

            // Extract and log the required data
            const extractedData = data.response.rows.map((item) => {
                // Extract common_name
                let commonNameArray = item.content.indexedStructured && item.content.indexedStructured.common_name;
                let commonName = (Array.isArray(commonNameArray) && commonNameArray.length > 0) ? commonNameArray[0] : "Unknown common name";

                // Extract bloom time
                let notesArray = item.content.freetext && item.content.freetext.notes;
                let bloomTimeNote = notesArray ? notesArray.find(note => note.label === "Bloom Time (Northern Hemisphere)") : null;
                let bloomTime = bloomTimeNote ? bloomTimeNote.content : "Unknown bloom time";

                // Extract image URL
                let mediaArray = item.content.descriptiveNonRepeating && item.content.descriptiveNonRepeating.online_media && item.content.descriptiveNonRepeating.online_media.media;
                let imageUrl = mediaArray && mediaArray.length > 0 ? mediaArray[0].content : "No image available";

                // Extract life form
                let physicalDescriptionArray = item.content.freetext.physicalDescription || [];
                let lifeFormObject = physicalDescriptionArray.find(desc => desc.label === "Life Form");
                let lifeForm = lifeFormObject ? lifeFormObject.content : "Unknown life form";

                // Extract taxonomic names
                let taxonomicNamesArray = item.content.freetext && item.content.freetext.taxonomicName;
                let taxonomicNames = {};
                if (Array.isArray(taxonomicNamesArray)) {
                    taxonomicNamesArray.forEach(taxonomicName => {
                        taxonomicNames[taxonomicName.label] = taxonomicName.content;
                    });
                }

                // Extract Pollination Syndrome
                let pollinationNote = notesArray ? notesArray.find(note => note.label === "Pollination Syndrome") : null;
                let pollinationSyndrome = pollinationNote ? pollinationNote.content : "Unknown pollination syndrome";

                // Extract Fragrance
                let fragranceNote = physicalDescriptionArray.find(desc => desc.label === "Fragrance");
                let fragrance = fragranceNote ? fragranceNote.content : "Unknown fragrance";

                // Extract Bloom Characteristics
                let bloomCharacteristicsNote = physicalDescriptionArray.find(desc => desc.label === "Bloom Characteristics");
                let bloomCharacteristics = bloomCharacteristicsNote ? bloomCharacteristicsNote.content : "Unknown bloom characteristics";

                // Extract guid link
                let guidLink = item.content.descriptiveNonRepeating && item.content.descriptiveNonRepeating.guid ? item.content.descriptiveNonRepeating.guid : "No GUID available";

                // Return the extracted data in the required structure
                return {
                    common_name: commonName,
                    bloom_time: bloomTime,
                    image_url: imageUrl,
                    taxonomic_names: taxonomicNames,
                    life_form: lifeForm,
                    pollination_syndrome: pollinationSyndrome,
                    fragrance: fragrance,
                    bloom_characteristics: bloomCharacteristics,
                    guid_link: guidLink
                };
            });

            // Print the extracted data to the console
            console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

            // Trigger the download of JSON data
            downloadJSON(extractedData, 'extractedQualData.json');
        })
        .catch(error => {
            console.error("Error fetching data:", error); // Handle and log any errors
        });
}

// Call the fetch function with the desired search term
fetchAllData('Orchids AND fragrance AND Pollination Syndrome AND online_media_type:"Images" AND object_type:"Living botanical specimens"');

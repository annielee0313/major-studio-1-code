// Function to trigger download of JSON data as a file
function downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
}

// Define your API key and base URL
const apiKey = "RLaXwT4AAXNEi9zDr6nd9cytOb4iWfhAl40ugta1";
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Function to fetch data from the API with pagination
function fetchAllData(searchTerm, numRows = 500) {
    let start = 0;
    let totalRows = 0;
    let allData = [];

    function fetchPage() {
        // Construct the URL for the API request with pagination
        let url = `${searchBaseURL}?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&rows=${numRows}&start=${start}`;
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

                // Extract and accumulate data
                let extractedData = extractData(data);
                allData = allData.concat(extractedData);

                // Update pagination info
                totalRows = data.response.rowCount;
                let numResults = data.response.rows.length;
                start += numResults;

                console.log("All Extracted Data:", allData); // Log accumulated data

                // Continue fetching if more data is available
                if (start < totalRows) {
                    fetchPage(); // Fetch next page
                } else {
                    console.log("All data fetched:", allData);

                    // Trigger download of the data
                    downloadJSON(allData, 'extractedData.json');
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error); // Handle and log any errors
            });
    }

    // Start fetching pages
    fetchPage();
}

// Function to extract the required data from the API response
function extractData(data) {
    // Ensure that data.response.rows is defined and is an array
    if (!data.response || !Array.isArray(data.response.rows)) {
        console.error("Invalid data structure");
        return [];
    }

    // Map over each item in the rows array to extract relevant data
    return data.response.rows.map((item) => {
        // Extract common_name
        let commonNameArray = item.content.indexedStructured && item.content.indexedStructured.common_name;
        let commonName = (Array.isArray(commonNameArray) && commonNameArray.length > 0) ? commonNameArray[0] : "Unknown common name";

        // Extract image URL and caption
        let mediaArray = item.content.descriptiveNonRepeating && item.content.descriptiveNonRepeating.online_media && item.content.descriptiveNonRepeating.online_media.media;
        let imageUrl = mediaArray && mediaArray.length > 0 ? mediaArray[0].content : "No image available";
        let imageCaption = mediaArray && mediaArray.length > 0 ? mediaArray[0].caption : "No caption available";

        // Extract bloom time
        let notesArray = item.content.freetext && item.content.freetext.notes;
        let bloomTimeNote = notesArray ? notesArray.find(note => note.label === "Bloom Time (Northern Hemisphere)") : null;
        let bloomTime = bloomTimeNote ? bloomTimeNote.content : "Unknown bloom time";

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


        return {
            common_name: commonName,
            image_url: imageUrl,
            image_caption: imageCaption,
            bloom_time: bloomTime,
            life_form: lifeForm,
            taxonomic_names: taxonomicNames
        };
    });
}

// Call the fetch function with the desired search term
fetchAllData('Orchids AND bloom time AND online_media_type:"Images" AND object_type:"Living botanical specimens"');

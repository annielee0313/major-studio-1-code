//fetch all data & get the data points i need

// API key and base URL
const apiKey = "RLaXwT4AAXNEi9zDr6nd9cytOb4iWfhAl40ugta1";
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Function to fetch data from the API
function fetchAllData(searchTerm, numRows = 500) {
    // Construct the URL for the API request without pagination
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

            // Log each row of data
            data.response.rows.forEach((row, index) => {
                console.log(`Row ${index + 1}:`, row);
            });

            console.log("All data fetched.");
        })
        .catch(error => {
            console.error("Error fetching data:", error); // Handle and log any errors
        });
}

// Call the fetch function
fetchAllData('Orchids AND fragrance AND Pollination Syndrome AND online_media_type:"Images" AND object_type:"Living botanical specimens"');

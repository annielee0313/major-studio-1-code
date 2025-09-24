// Test different image URL patterns from the cleanedOrchidData.json
// This will help us identify which URLs work and which ones return 404

const testUrls = [
    // Sample URLs from your data with different patterns
    'https://ids.si.edu/ids/deliveryService?id=SG-2016-0350A-101',
    'https://ids.si.edu/ids/deliveryService?id=SG-2011-2071A-102-EL-000001',
    'https://ids.si.edu/ids/deliveryService?id=SG-2020-0402A-PLT1-HL-000001',
    'https://ids.si.edu/ids/deliveryService?id=SG-2008-3140A-101-000002',
    'https://ids.si.edu/ids/deliveryService?id=SG-2009-1169_A_BR',
    'https://ids.si.edu/ids/deliveryService?id=SG-2016-0352A-INF1-HL'
];

// Function to test URL accessibility
async function testUrl(url) {
    try {
        const response = await fetch(url, {
            method: 'HEAD', // Use HEAD to just check if resource exists
            mode: 'no-cors' // Handle CORS issues
        });
        
        return {
            url: url,
            status: 'accessible',
            response: response.status || 'no-cors-mode'
        };
    } catch (error) {
        return {
            url: url,
            status: 'error',
            error: error.message
        };
    }
}

// Function to test URLs with parameters
async function testUrlWithParams(url) {
    const testParams = [
        '',
        '&max_w=200',
        '&max_w=200&max_h=200',
        '&max=200'
    ];
    
    const results = [];
    for (const param of testParams) {
        const fullUrl = url + param;
        console.log('Testing:', fullUrl);
        results.push(await testUrl(fullUrl));
    }
    return results;
}

// Test all URLs
async function runTests() {
    console.log('Testing Image URLs from cleanedOrchidData.json...\n');
    
    for (const baseUrl of testUrls) {
        console.log(`\n--- Testing base URL: ${baseUrl} ---`);
        const results = await testUrlWithParams(baseUrl);
        results.forEach(result => {
            console.log(`${result.url}: ${result.status}`, result.error || result.response);
        });
    }
}

// Load and analyze patterns from your data
async function analyzeDataUrls() {
    try {
        const response = await fetch('./cleanedOrchidData.json');
        const data = await response.json();
        
        // Analyze URL patterns
        const urlPatterns = new Map();
        
        data.forEach((item, index) => {
            if (item.image_url) {
                const id = item.image_url.split('id=')[1];
                if (id) {
                    // Extract pattern (remove specific identifiers)
                    let pattern = id;
                    
                    // Group by different patterns
                    if (id.includes('-EL-')) {
                        pattern = 'EL-pattern';
                    } else if (id.includes('-PLT1-HL-')) {
                        pattern = 'PLT1-HL-pattern';
                    } else if (id.includes('-INF1-HL')) {
                        pattern = 'INF1-HL-pattern';
                    } else if (id.includes('_A_BR')) {
                        pattern = 'A_BR-pattern';
                    } else if (id.includes('-000001') || id.includes('-000002')) {
                        pattern = 'numbered-suffix';
                    } else if (id.match(/^SG-\d{4}-\d{4}[A-Z]-\d{3}$/)) {
                        pattern = 'standard-pattern';
                    } else {
                        pattern = 'other';
                    }
                    
                    if (!urlPatterns.has(pattern)) {
                        urlPatterns.set(pattern, []);
                    }
                    urlPatterns.get(pattern).push({
                        index: index,
                        id: id,
                        url: item.image_url,
                        commonName: item.common_name
                    });
                }
            }
        });
        
        console.log('\n--- URL Pattern Analysis ---');
        urlPatterns.forEach((items, pattern) => {
            console.log(`\n${pattern}: ${items.length} items`);
            console.log('Sample URLs:');
            items.slice(0, 3).forEach(item => {
                console.log(`  - ${item.url} (${item.commonName})`);
            });
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Run the analysis
runTests();
analyzeDataUrls();
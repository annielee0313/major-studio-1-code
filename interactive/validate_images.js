// Image validation script for cleanedOrchidData.json
// This will test all image URLs and identify which ones are broken

let globalData = [];
let brokenImages = [];
let workingImages = [];
let totalImages = 0;
let processedImages = 0;

// Helper function to safely create image URLs with parameters
function getImageUrl(baseUrl, width = 200, height = null) {
    if (!baseUrl) return null;
    
    // Check if URL already has max_w parameter to avoid duplicates
    if (baseUrl.includes('max_w=') || baseUrl.includes('max_h=')) {
        return baseUrl;
    }
    
    let params = `&max_w=${width}`;
    if (height) {
        params += `&max_h=${height}`;
    }
    
    return baseUrl + params;
}

// Function to test if image loads successfully
function testImage(orchid, index) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            resolve({
                orchid,
                index,
                status: 'timeout',
                url: getImageUrl(orchid.image_url, 200)
            });
        }, 10000); // 10 second timeout

        img.onload = function() {
            clearTimeout(timeout);
            resolve({
                orchid,
                index,
                status: 'success',
                url: this.src,
                dimensions: { width: this.naturalWidth, height: this.naturalHeight }
            });
        };

        img.onerror = function() {
            clearTimeout(timeout);
            resolve({
                orchid,
                index,
                status: 'error',
                url: this.src
            });
        };

        img.src = getImageUrl(orchid.image_url, 200);
    });
}

// Function to categorize broken URLs by pattern
function categorizeUrl(url) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (!id) return 'unknown';
    
    if (id.includes('-EL-')) return 'EL-pattern';
    if (id.includes('-PLT1-HL-')) return 'PLT1-HL-pattern';
    if (id.includes('-INF1-HL')) return 'INF1-HL-pattern';
    if (id.includes('_A_BR')) return 'A_BR-pattern';
    if (id.includes('-000001') || id.includes('-000002')) return 'numbered-suffix';
    if (id.match(/SG-\d{4}-\d{4}[A-Z]-\d{3}$/)) return 'standard-pattern';
    return 'other-pattern';
}

// Main validation function
async function validateAllImages() {
    console.log('Loading orchid data...');
    
    try {
        const response = await fetch('./cleanedOrchidData.json');
        globalData = await response.json();
        
        const orchidsWithImages = globalData.filter(orchid => orchid.image_url);
        totalImages = orchidsWithImages.length;
        
        console.log(`Found ${totalImages} orchids with image URLs. Testing...`);
        
        // Test images in batches to avoid overwhelming the server
        const batchSize = 10;
        const updateProgress = () => {
            console.log(`Progress: ${processedImages}/${totalImages} (${Math.round(processedImages/totalImages*100)}%)`);
            updateDisplay();
        };

        for (let i = 0; i < orchidsWithImages.length; i += batchSize) {
            const batch = orchidsWithImages.slice(i, i + batchSize);
            const promises = batch.map((orchid, batchIndex) => testImage(orchid, i + batchIndex));
            
            const results = await Promise.all(promises);
            
            results.forEach(result => {
                if (result.status === 'success') {
                    workingImages.push(result);
                } else {
                    brokenImages.push(result);
                }
                processedImages++;
            });
            
            updateProgress();
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n=== VALIDATION COMPLETE ===');
        console.log(`Working images: ${workingImages.length}/${totalImages} (${Math.round(workingImages.length/totalImages*100)}%)`);
        console.log(`Broken images: ${brokenImages.length}/${totalImages} (${Math.round(brokenImages.length/totalImages*100)}%)`);
        
        generateReport();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Function to update the display during processing
function updateDisplay() {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <h2>Image Validation Progress</h2>
        <div class="progress-bar">
            <div class="progress" style="width: ${processedImages/totalImages*100}%"></div>
        </div>
        <p>Processed: ${processedImages}/${totalImages}</p>
        <p>Working: ${workingImages.length} | Broken: ${brokenImages.length}</p>
    `;
}

// Generate detailed report
function generateReport() {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    // Categorize broken images by pattern
    const brokenPatterns = {};
    const workingPatterns = {};
    
    brokenImages.forEach(result => {
        const pattern = categorizeUrl(result.url);
        brokenPatterns[pattern] = (brokenPatterns[pattern] || 0) + 1;
    });
    
    workingImages.forEach(result => {
        const pattern = categorizeUrl(result.url);
        workingPatterns[pattern] = (workingPatterns[pattern] || 0) + 1;
    });
    
    let report = `
        <h2>Image Validation Results</h2>
        <div class="summary">
            <div class="stat working">✓ Working: ${workingImages.length}/${totalImages} (${Math.round(workingImages.length/totalImages*100)}%)</div>
            <div class="stat broken">✗ Broken: ${brokenImages.length}/${totalImages} (${Math.round(brokenImages.length/totalImages*100)}%)</div>
        </div>
        
        <h3>Broken Images by Pattern:</h3>
        <div class="patterns">
    `;
    
    Object.entries(brokenPatterns).forEach(([pattern, count]) => {
        const total = (brokenPatterns[pattern] || 0) + (workingPatterns[pattern] || 0);
        const percentage = Math.round(count / total * 100);
        report += `<div class="pattern-stat broken">
            ${pattern}: ${count}/${total} broken (${percentage}%)
        </div>`;
    });
    
    report += `
        </div>
        <h3>Working Images by Pattern:</h3>
        <div class="patterns">
    `;
    
    Object.entries(workingPatterns).forEach(([pattern, count]) => {
        const total = (brokenPatterns[pattern] || 0) + (workingPatterns[pattern] || 0);
        const percentage = Math.round(count / total * 100);
        report += `<div class="pattern-stat working">
            ${pattern}: ${count}/${total} working (${percentage}%)
        </div>`;
    });
    
    report += '</div>';
    
    // Add sample broken images
    if (brokenImages.length > 0) {
        report += `
            <h3>Sample Broken Images:</h3>
            <div class="broken-samples">
        `;
        
        brokenImages.slice(0, 10).forEach(result => {
            report += `
                <div class="broken-sample">
                    <strong>${result.orchid.common_name}</strong><br>
                    <code>${result.url}</code><br>
                    <em>${categorizeUrl(result.url)}</em>
                </div>
            `;
        });
        
        report += '</div>';
    }
    
    resultsDiv.innerHTML = report;
    
    // Generate downloadable report
    const reportData = {
        summary: {
            total: totalImages,
            working: workingImages.length,
            broken: brokenImages.length
        },
        brokenPatterns,
        workingPatterns,
        brokenSamples: brokenImages.slice(0, 20),
        workingSamples: workingImages.slice(0, 10)
    };
    
    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Full Report (JSON)';
    downloadBtn.onclick = () => downloadReport(reportData);
    resultsDiv.appendChild(downloadBtn);
}

function downloadReport(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-validation-report.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Start validation when page loads
document.addEventListener('DOMContentLoaded', () => {
    validateAllImages();
});
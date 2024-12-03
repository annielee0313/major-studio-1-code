document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    let imagesLoaded = 0;
    let totalImages = 0;

    // Function to update loading progress
    function updateLoadingProgress() {
        imagesLoaded++;
        if (imagesLoaded >= totalImages) {
            // All images loaded, fade out loading screen
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            
            // Remove loading screen after fade
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Start loading process when data is received
    d3.json('cleanedOrchidData.json').then(data => {
        // Count total images to load
        totalImages = data.filter(d => d.image_url).length;
        
        // Preload all images
        data.forEach(d => {
            if (d.image_url) {
                const img = new Image();
                img.onload = updateLoadingProgress;
                img.onerror = updateLoadingProgress; // Count errors as loaded to prevent hanging
                img.src = `${d.image_url}&max_w=200`;
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentMonth = '';
    
    const contentDiv = document.getElementById('content');
    const monthScale = document.getElementById('month-scale');
    const currentMonthIndicator = document.getElementById('current-month-indicator');
    const orchidCountDisplay = document.getElementById('orchid-count');
    
    // Create month scale
    months.forEach(month => {
        const monthLabel = document.createElement('div');
        monthLabel.textContent = month;
        monthScale.appendChild(monthLabel);

        // Add static line container for each month
        const lineContainer = document.createElement('div');
        lineContainer.className = 'month-line';
        document.body.appendChild(lineContainer);
    });

    // Load and process the data
    d3.json('cleanedOrchidData.json').then(data => {
        const totalOrchids = data.length;

        // Calculate counts for all months once
        const monthCounts = months.map((month, idx) => {
            return data.filter(d => d.cleaned_bloom_months.includes(idx + 1)).length;
        });

        // Set static line widths based on counts
        const monthLines = document.querySelectorAll('.month-line');
        monthLines.forEach((line, idx) => {
            const count = monthCounts[idx];
            const width = (count / totalOrchids) * 100 * 0.3;
            line.style.width = `${width}%`;
        });

        function updateChart(month) {
            if (month === currentMonth) return;
            currentMonth = month;

            const monthIndex = months.indexOf(month);
            const count = monthCounts[monthIndex];

            // Update count display
            orchidCountDisplay.textContent = count;

            // Update current month indicator width
            const monthIndicatorWidth = (count / totalOrchids) * 100 * 0.3;
            currentMonthIndicator.style.width = `${monthIndicatorWidth}%`;
        }

        // Position static lines
        function updateLinePositions() {
            const monthHeight = monthScale.clientHeight / 12;
            const monthScaleTop = window.innerHeight / 2 - monthScale.clientHeight / 2;
            
            monthLines.forEach((line, idx) => {
                line.style.top = `${monthScaleTop + (idx * monthHeight) + (monthHeight / 2)}px`;
            });
        }

        // Handle scroll
        contentDiv.addEventListener('scroll', () => {
            const scrollY = contentDiv.scrollTop;
            const viewportHeight = contentDiv.clientHeight;
            const totalHeight = contentDiv.scrollHeight - viewportHeight;

            // Calculate current month based on scroll position
            const monthIndex = Math.floor((scrollY / totalHeight) * 12);
            const clampedMonthIndex = Math.max(0, Math.min(11, monthIndex));
            const monthLabel = months[clampedMonthIndex];

            // Update month indicator position
            const monthHeight = monthScale.clientHeight / 12;
            const monthScaleTop = window.innerHeight / 2 - monthScale.clientHeight / 2;
            currentMonthIndicator.style.top = `${monthScaleTop + (clampedMonthIndex * monthHeight) + (monthHeight / 2)}px`;

            // Update the orchid count display position
            orchidCountDisplay.style.top = currentMonthIndicator.style.top;

            // Update chart
            updateChart(monthLabel);
        });

        // Handle window resize
        window.addEventListener('resize', updateLinePositions);

        // Initialize
        updateChart('Jan');
        updateLinePositions();
        
        // Position month indicator for January
        const monthHeight = monthScale.clientHeight / 12;
        const monthScaleTop = window.innerHeight / 2 - monthScale.clientHeight / 2;
        currentMonthIndicator.style.top = `${monthScaleTop + (monthHeight / 2)}px`;
        orchidCountDisplay.style.top = currentMonthIndicator.style.top;

        // Trigger initial scroll event
        contentDiv.dispatchEvent(new Event('scroll'));
    });
});
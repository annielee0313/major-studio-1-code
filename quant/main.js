document.addEventListener("DOMContentLoaded", function () {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentMonth = '';  // Variable to track the current month

    const monthScale = document.getElementById('month-scale');
    const currentMonthIndicator = document.getElementById('current-month-indicator');
    const svg = d3.select("#bubble-chart");
    const svgNode = document.getElementById("bubble-chart"); // Get the actual DOM node for dynamic sizing

    function getSVGDimensions() {
        return {
            width: svgNode.clientWidth,
            height: svgNode.clientHeight
        };
    }

    // Create the month scale
    months.forEach(month => {
      const monthLabel = document.createElement('div');
      monthLabel.textContent = month;
      monthScale.appendChild(monthLabel);
    });

    // Load the orchid data
    d3.json('cleanedData.json').then(data => {

    // Define clip path for circle clipping
    svg.append("defs").append("clipPath")
        .attr("id", "circle-clip")
        .append("circle")
        .attr("r", 0)  // Initially set to 0, will be updated dynamically
        .attr("cx", 0)
        .attr("cy", 0);

    // Preload all image URLs once the data is available
    data.forEach(d => {
        const img = new Image();
        img.src = d.image_url;  // Start loading the image in the browser cache
    });



      // Function to update the bubble chart based on the month
      function updateChart(month) {
        if (month === currentMonth) return;  // Don't update if the month hasn't changed
        currentMonth = month;

        const { width, height } = getSVGDimensions();  // Dynamically get SVG width and height
        const centerX = width / 2;
        const centerY = height;
        const radiusBoundary = width / 2;  // Define the boundary based on the width (since it's a semicircle)

        // Filter the orchids that bloom in the selected month
        const filteredData = data.filter(d => d.bloom_time.includes(month));


        // Calculate the width for the current month indicator
        const totalOrchids = data.length; // Total number of orchids
        const monthIndicatorWidth = (filteredData.length / totalOrchids) * 100 * 0.3; // Percentage of orchids blooming in the month

        // Set the width of the current month indicator
        currentMonthIndicator.style.width = `${monthIndicatorWidth}%`;

        // Update the orchid count display
        const orchidCountDisplay = document.getElementById('orchid-count');
        orchidCountDisplay.textContent = `${filteredData.length}`;

        // Dynamically calculate bubble radius based on the number of data points
        const maxBubbles = Math.min(filteredData.length, 2000);  // Set an upper limit if there are many data points
        const radius = Math.max(10, Math.min(50, Math.sqrt((width * height) / (maxBubbles * Math.PI))));  // Adjust radius

        // Update clipPath radius
        svg.select("#circle-clip circle")
        .attr("r", radius);

        

        // Create a simulation for the bubble chart
        const simulation = d3.forceSimulation(filteredData)
            .force("x", d3.forceX(centerX).strength(0.01)) 
            .force("y", d3.forceY(centerY).strength(0.01)) 
            .force("collide", d3.forceCollide(radius + 5))
            .stop();

        // Remove old bubbles
        const bubbles = svg.selectAll("g")
          .data(filteredData, d => d.common_name);  // Use a key to keep track of elements by common_name

        // Exit old elements
        bubbles.exit().remove();

        // Enter new elements
        const enterBubbles = bubbles.enter()
          .append("g");

        enterBubbles.append("circle")
          .attr("r", radius)
          .attr("cx", 0)  // Positioned at the center of the group
          .attr("cy", 0)  // Positioned at the center of the group
          .attr("fill", "#0B1A0B");
        

        enterBubbles.append("image")
          .attr("xlink:href", d => d.image_url)
          .attr("x", d => -radius)
          .attr("y", d => -radius)
          .attr("width", radius * 2)
          .attr("height", radius * 2)
          .attr("clip-path", "url(#circle-clip)");

        enterBubbles.append("circle")
          .attr("r", radius)
          .attr("cx", 0)  // Positioned at the center of the group
          .attr("cy", 0)  // Positioned at the center of the group
          .attr("fill", "none")
          .attr("stroke-width", 3)
          .attr("clip-path", "url(#circle-clip)");


        // Merge old and new elements
        const mergedBubbles = enterBubbles.merge(bubbles);

        // Custom function to constrain bubbles inside the semicircle
        function constrainToSemicircle(node) {
          const dx = node.x - centerX;
          const dy = node.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > radiusBoundary) {
            const angle = Math.atan2(dy, dx);
            node.x = centerX + radiusBoundary * Math.cos(angle);
            node.y = centerY + radiusBoundary * Math.sin(angle);
          }

          // Constrain to lower half only
          if (node.y < centerY - radiusBoundary) {
            node.y = centerY - radiusBoundary;
          }
        }

        // Start simulation with filtered data
        simulation.nodes(filteredData);
        simulation.on("tick", function () {
          mergedBubbles
            .attr("transform", d => {
              constrainToSemicircle(d); // Apply constraint
              return `translate(${d.x}, ${d.y})`;
            });
        });

        simulation.alpha(1).restart(); // Restart the simulation with new nodes

    // Tooltip and bubble hover functionality
    mergedBubbles
    .on("mouseover", function (event, d) {
    // Bring the hovered bubble to the front
    d3.select(this).raise();

    // Scale the bubble on hover
    d3.select(this)
        .transition()
        .duration(200)
        .attr("transform", function (d) {
        return `translate(${d.x}, ${d.y}) scale(3.8)`;  // Scale the bubble
        });
        

    // Remove any existing tooltips
    d3.selectAll(".tooltip").remove();

    // Add the tooltip
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .html(`${d.common_name}`)
        // .html(`<strong>${d.common_name}</strong><br>Life Form: ${d.life_form}<br>Bloom months: ${d.bloom_time}`)
        .style("position", "absolute")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })

    .on("mouseout", function () {
    // Reset the scale of the bubble on mouse out
    d3.select(this)
        .transition()
        .duration(200)
        .attr("transform", function (d) {
        return `translate(${d.x}, ${d.y}) scale(1)`;  // Reset scale
        });

    // Remove the tooltip
    d3.selectAll(".tooltip").remove();
    });
  }
    

      // Handle scroll and update the bubble chart based on the current month
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight - viewportHeight;

        // Calculate the current month based on scroll position
        const monthIndex = Math.floor((scrollY / totalHeight) * 12); // Use 12 for 12 months

        // Clamp monthIndex to valid range (0 to 11)
        const clampedMonthIndex = Math.max(0, Math.min(11, monthIndex));  // Ensure it stays within the 12 months
        const monthLabel = months[clampedMonthIndex];  // Get the corresponding month label

        // Log the current month to the console
        console.log("Current month:", monthLabel);

        // Update the current month indicator position
        const monthHeight = monthScale.clientHeight / 12; // Height for each month
        const monthScaleTop = window.innerHeight / 2 - monthScale.clientHeight / 2; // Center the month scale
        currentMonthIndicator.style.top = `${monthScaleTop + (clampedMonthIndex * monthHeight) + (monthHeight / 2)}px`;

        // Update the bubble chart for the current month
        updateChart(monthLabel);
    });


      // Initialize the chart with the first month
      updateChart('Jan');

      // Set the month indicator position to January
        currentMonthIndicator.style.top = `${monthScale.clientHeight / 12 * 0}px`; // Position it at the top of the scale

        // Trigger the scroll event to ensure the correct month is displayed
        window.dispatchEvent(new Event('scroll'));
    });
});

//Life form buttons
document.addEventListener("DOMContentLoaded", function () {
    const selectedLifeForms = []; // Array to track selected life forms

    // Get all filter buttons
    const epiphyticButton = document.getElementById('epiphytic');
    const terrestrialButton = document.getElementById('terrestrial');
    const lithophyticButton = document.getElementById('lithophytic');

    // Toggle the selected class and update selected life forms
    function toggleLifeForm(button, lifeForm) {
        button.classList.toggle('active');
        const index = selectedLifeForms.indexOf(lifeForm);

        if (index > -1) {
            // If life form is already selected, remove it
            selectedLifeForms.splice(index, 1);
        } else {
            selectedLifeForms.push(lifeForm);
        }

        // After updating the selected life forms, update the bubbles
        updateBubblesWithLifeForm();
    }

    epiphyticButton.addEventListener('click', function () {
        toggleLifeForm(this, 'Epiphytic');
    });

    terrestrialButton.addEventListener('click', function () {
        toggleLifeForm(this, 'Terrestrial');
    });

    lithophyticButton.addEventListener('click', function () {
        toggleLifeForm(this, 'Lithophytic');
    });

    function updateBubblesWithLifeForm() {
        const bubbles = d3.selectAll('g');

        // Loop through each bubble and check its life form
        bubbles.select('circle')
            .attr('stroke', d => {
                if (selectedLifeForms.includes(d.life_form)) {
                    return '#BBFFB0';  // Highlight with green border
                } else {
                    return 'none'; 
                }
            });
    }
});

 // Life Form Pop Up
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("lifeFormModal");
    const modalContent = document.querySelector(".modal-content");

    const lifeFormLabel = document.getElementById("life-form-label");

    lifeFormLabel.addEventListener("click", function () {
        modal.style.display = "block";
    });

    // click anywhere to close
    modal.addEventListener("click", function (event) {
        if (event.target !== modalContent) {
            modal.style.display = "none";
        }
    });
});



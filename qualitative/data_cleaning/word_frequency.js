// Load the JSON data
d3.json('extractedQualData.json').then(data => { 
    // Extract pollination syndromes and fragrances separately
    let pollinationSyndromes = data.map(d => d.pollination_syndrome);
    let fragrances = data.map(d => d.fragrance);
    
    // Analyze and get word frequency for pollination syndromes
    let pollinationFrequency = analyzeWords(pollinationSyndromes);
    displayData(pollinationFrequency.slice(0, 50), 'Top 50 Pollination Syndrome Word Frequency', 'pollinators-chart');
  
    // Analyze and get word frequency for fragrances
    let fragranceFrequency = analyzeWords(fragrances);
    displayData(fragranceFrequency.slice(0, 50), 'Top 50 Fragrance Word Frequency', 'fragrance-chart');
  });
  
  // Analyze individual words (adapted from your example)
  function analyzeWords(array) {
    let frequency = [];
    let word;
  
    array.forEach(phrase => {
      // Split each phrase into individual words
      let words = phrase.toLowerCase().split(/\s+/);
  
      words.forEach(w => {
        // Remove special characters (except spaces)
        word = w.replace(/[^a-zA-Z]/g, "");
  
        if (word.length > 0) { // Check if the word is not empty after cleaning
          let match = false;
  
          // Count the occurrences of each word
          frequency.forEach(i => {
            if (i.word === word) {
              i.count++;
              match = true;
            }
          });
  
          // If the word is new, add it to the frequency array
          if (!match) {
            frequency.push({
              word: word,
              count: 1
            });
          }
        }
      });
    });
  
    // Sort the words by frequency
    frequency.sort((a, b) => b.count - a.count);
    return frequency;
  }
  
  function displayData(frequency, title, containerId) {
    // Define dimensions and margins
    const margin = {top: 100, right: 50, bottom: 100, left: 80};
    const width = 960;
    const height = 500;
  
    // Define scales
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(frequency, d => d.count)])
      .range([height - margin.bottom, margin.top]);
  
    const xScale = d3.scaleBand()
      .domain(frequency.map(d => d.word))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    // Create an SVG element inside the specified container
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'background-color:#C8E6F4');
    
    // Create the bars
    svg.append('g')
      .selectAll('rect')
      .data(frequency)
      .join('rect')
      .attr('x', d => xScale(d.word))
      .attr('y', d => yScale(d.count))
      .attr('height', d => yScale(0) - yScale(d.count))
      .attr('width', xScale.bandwidth())
      .style('fill', 'steelblue');
  
    // Add the x-axis
    const xAxis = d3.axisBottom(xScale);
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.6em')
      .attr('dy', '-.1em')
      .attr('transform', 'rotate(-45)');
  
    // Add the y-axis
    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
  
    // Add the chart title
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 50)
      .style('font-size', '24px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'bold')
      .text(title);
  }
  
document.addEventListener("DOMContentLoaded", function () {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    const monthScale = document.getElementById('month-scale');
    const currentMonthIndicator = document.getElementById('current-month-indicator');
  
    // Create the month scale
    months.forEach(month => {
      const monthLabel = document.createElement('div');
      monthLabel.textContent = month;
      monthScale.appendChild(monthLabel);
    });
  
    // Handle scroll and update month indicator
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight - viewportHeight;
      
      // Calculate the current month based on scroll position
      const monthIndex = Math.floor((scrollY / totalHeight) * 12);
      const monthLabel = months[Math.max(0, Math.min(11, monthIndex))];
      
      // Update current month indicator position
      const monthHeight = monthScale.clientHeight / 12; // Height for each month
      currentMonthIndicator.style.top = `${monthIndex * monthHeight}px`;
  
      // Log the current month
      console.log(`Current month: ${monthLabel}`);
    });
  
    // Initialize the month indicator
    window.dispatchEvent(new Event('scroll'));
  });
  
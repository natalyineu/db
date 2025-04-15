/**
 * Simple script to troubleshoot refresh button issues on AI-Vertise dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the data dashboard page
  if (window.location.href.includes('ai-vertise.com/data')) {
    console.log('Data dashboard detected, adding refresh listener...');
    
    // Find the refresh button
    const refreshButton = document.querySelector('button:has(svg), [aria-label="Refresh"]');
    
    if (refreshButton) {
      console.log('Refresh button found, attaching enhanced refresh handler');
      
      // Override the existing click handler with our enhanced version
      refreshButton.addEventListener('click', function(event) {
        console.log('Refresh button clicked, forcing cache invalidation and data reload');
        
        // Prevent default action if needed
        event.preventDefault();
        
        // Show visual feedback that something is happening
        refreshButton.classList.add('refreshing');
        refreshButton.disabled = true;
        
        // Add a temporary loading indicator
        const originalContent = refreshButton.innerHTML;
        refreshButton.innerHTML = '<span class="loading-spinner"></span> Refreshing...';
        
        // Force a fetch with cache-busting parameter
        fetch('/api/profile?nocache=' + Date.now(), { 
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'same-origin'
        })
        .then(response => {
          console.log('Profile data refreshed:', response.ok);
          return fetchDashboardData();
        })
        .then(() => {
          console.log('Dashboard data refreshed, reloading page');
          // Reload the current page with cache busting
          window.location.reload(true);
        })
        .catch(error => {
          console.error('Error during refresh:', error);
          alert('Refresh failed. Please try reloading the page manually.');
          
          // Restore button state
          refreshButton.innerHTML = originalContent;
          refreshButton.disabled = false;
          refreshButton.classList.remove('refreshing');
        });
      }, true); // Use capturing to ensure our handler runs first
      
      console.log('Enhanced refresh handler attached successfully');
    } else {
      console.warn('Refresh button not found on page');
    }
  }
});

// Add some CSS for the loading indicator
const style = document.createElement('style');
style.textContent = `
  .refreshing {
    opacity: 0.7;
    cursor: wait !important;
  }
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Don't try to fetch dashboard data until it's implemented
function fetchDashboardData() {
  console.log('Dashboard data API not implemented yet');
  return Promise.resolve({ success: false, message: 'API not implemented' });
  
  /* Original code commented out until API is implemented
  return fetch('/api/dashboard-data?nocache=' + Date.now(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getTokenFromLocalStorage()
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: error.message };
  });
  */
}

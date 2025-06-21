// Debug script to log errors
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.message, 'at', event.filename, 'line', event.lineno);
    
    // Create an error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.right = '10px';
    errorDiv.style.backgroundColor = '#d32f2f';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerHTML = `<strong>JavaScript Error:</strong> ${event.message} at ${event.filename} line ${event.lineno}`;
    
    document.body.appendChild(errorDiv);
});

// Log when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Check if estimate data is available
    if (typeof estimate !== 'undefined') {
        console.log('Estimate data available:', estimate);
    } else {
        console.error('Estimate data not available');
        
        // Create an error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '10px';
        errorDiv.style.left = '10px';
        errorDiv.style.right = '10px';
        errorDiv.style.backgroundColor = '#d32f2f';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = '<strong>Error:</strong> Estimate data not available';
        
        document.body.appendChild(errorDiv);
    }
});
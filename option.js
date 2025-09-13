document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Load saved settings
  chrome.storage.local.get(['geminiApiKey', 'model', 'maxTokens', 'temperature'], function(result) {
    if (result.geminiApiKey) {
      document.getElementById('api-key').value = result.geminiApiKey;
    }
    if (result.model) {
      document.getElementById('model-select').value = result.model;
    } else {
      // Default to gemini-1.5-pro as it's more stable
      document.getElementById('model-select').value = 'gemini-1.5-pro';
    }
    if (result.maxTokens) {
      document.getElementById('max-tokens').value = result.maxTokens;
    }
    if (result.temperature) {
      document.getElementById('temperature').value = result.temperature;
    }
  });
  
  // Save API key
  document.getElementById('save-api-key').addEventListener('click', function() {
    const apiKey = document.getElementById('api-key').value.trim();
    const statusDiv = document.getElementById('api-status');
    
    if (!apiKey) {
      statusDiv.textContent = 'API key cannot be empty';
      statusDiv.className = 'status error';
      return;
    }
    
    // Basic validation for API key format
    if (!apiKey.startsWith('AIza')) {
      statusDiv.textContent = 'Invalid API key format. Keys should start with "AIza"';
      statusDiv.className = 'status error';
      return;
    }
    
    statusDiv.textContent = 'Saving API key...';
    statusDiv.className = 'status warning';
    
    chrome.storage.local.set({ geminiApiKey: apiKey }, function() {
      statusDiv.textContent = 'API key saved! Click "Test API Key" to verify it works.';
      statusDiv.className = 'status success';
    });
  });
  
  // Test API key
  document.getElementById('test-api-key').addEventListener('click', async function() {
    const apiKey = document.getElementById('api-key').value.trim();
    const statusDiv = document.getElementById('api-status');
    
    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API key first';
      statusDiv.className = 'status error';
      return;
    }
    
    statusDiv.innerHTML = `
      <div class="warning">Testing API key...</div>
      <div id="test-details"></div>
    `;
    statusDiv.className = 'status warning';
    
    const detailsDiv = document.getElementById('test-details');
    
    try {
      // Test 1: Basic connectivity
      detailsDiv.innerHTML += '<p>Step 1: Testing network connectivity...</p>';
      await fetch('https://www.google.com', { method: 'HEAD' });
      detailsDiv.innerHTML += '<p>✓ Network connectivity OK</p>';
      
      // Test 2: API endpoint accessibility
      detailsDiv.innerHTML += '<p>Step 2: Testing API endpoint...</p>';
      const modelsResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models');
      detailsDiv.innerHTML += `<p>✓ API endpoint accessible (Status: ${modelsResponse.status})</p>`;
      
      // Test 3: Try primary endpoint with delay
      detailsDiv.innerHTML += '<p>Step 3: Testing primary endpoint (gemini-1.5-pro)...</p>';
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      let result = await testApiKeyWithEndpoint(apiKey, 'gemini-1.5-pro');
      detailsDiv.innerHTML += '<p>✓ Primary endpoint working</p>';
      
      statusDiv.innerHTML = `
        <div class="success">API key is working correctly!</div>
        <div id="test-details">${detailsDiv.innerHTML}</div>
      `;
      statusDiv.className = 'status success';
    } catch (error) {
      console.error('Primary endpoint failed:', error);
      
      // Check if it's a 429 error
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
        // Try fallback endpoint with longer delay
        try {
          detailsDiv.innerHTML += '<p>Step 4: Rate limited, waiting 2 seconds and trying fallback (gemini-1.0-pro)...</p>';
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          let result = await testApiKeyWithEndpoint(apiKey, 'gemini-1.0-pro');
          detailsDiv.innerHTML += '<p>✓ Fallback endpoint working after delay</p>';
          
          statusDiv.innerHTML = `
            <div class="warning">API key works with fallback model (gemini-1.0-pro) - rate limited</div>
            <div id="test-details">${detailsDiv.innerHTML}</div>
          `;
          statusDiv.className = 'status warning';
          
          // Update the model selection to use the fallback
          document.getElementById('model-select').value = 'gemini-1.0-pro';
          chrome.storage.local.set({ model: 'gemini-1.0-pro' });
        } catch (fallbackError) {
          console.error('Fallback endpoint failed:', fallbackError);
          
          // Try different API version with even longer delay
          try {
            detailsDiv.innerHTML += '<p>Step 5: Fallback endpoint failed, trying v1 API...</p>';
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
            let result = await testApiKeyWithV1(apiKey);
            detailsDiv.innerHTML += '<p>✓ v1 API working after delay</p>';
            
            statusDiv.innerHTML = `
              <div class="warning">API key works with v1 API (gemini-pro) - rate limited</div>
              <div id="test-details">${detailsDiv.innerHTML}</div>
            `;
            statusDiv.className = 'status warning';
            
            // Update the model selection to use the v1 model
            document.getElementById('model-select').value = 'gemini-1.0-pro';
            chrome.storage.local.set({ model: 'gemini-1.0-pro' });
          } catch (v1Error) {
            console.error('v1 API failed:', v1Error);
            
            let errorMessage = 'All endpoints failed';
            let diagnosticInfo = `
              <p><strong>Error Details:</strong></p>
              <ul>
                <li>Primary endpoint: ${error.message}</li>
                <li>Fallback endpoint: ${fallbackError.message}</li>
                <li>v1 API: ${v1Error.message}</li>
              </ul>
              <p><strong>This suggests:</strong></p>
              <ul>
                <li>Region restrictions (Gemini not available in your country)</li>
                <li>IP-based rate limiting</li>
                <li>Network-level blocking</li>
              </ul>
              <p><strong>Solutions:</strong></p>
              <ul>
                <li>Try using a VPN to connect from US/Europe</li>
                <li>Wait a few hours before trying again</li>
                <li>Use a different internet connection</li>
                <li>Try from a different location/network</li>
              </ul>
            `;
            
            statusDiv.innerHTML = `
              <div class="error">
                <strong>Error:</strong> ${errorMessage}<br>
                ${diagnosticInfo}
              </div>
              <div id="test-details">${detailsDiv.innerHTML}</div>
            `;
            statusDiv.className = 'status error';
          }
        }
      } else {
        statusDiv.innerHTML = `
          <div class="error">
            <strong>Error:</strong> ${error.message}<br>
            <strong>Details:</strong> <pre>${JSON.stringify(error, null, 2)}</pre>
          </div>
          <div id="test-details">${detailsDiv.innerHTML}</div>
        `;
        statusDiv.className = 'status error';
      }
    }
  });
  
  // Run diagnostics
  document.getElementById('run-diagnostics').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('diagnostics-results');
    resultsDiv.innerHTML = '<div class="warning">Running diagnostics...</div>';
    
    const apiKey = document.getElementById('api-key').value.trim();
    const results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      apiKeyProvided: !!apiKey,
      apiKeyFormat: apiKey && apiKey.startsWith('AIza') ? 'Valid' : 'Invalid',
      tests: {}
    };
    
    // Test 1: Network connectivity
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      results.tests.network = { status: 'Pass', message: 'Network connectivity OK' };
    } catch (error) {
      results.tests.network = { status: 'Fail', message: error.message };
    }
    
    // Test 2: API connectivity (without key)
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      results.tests.apiConnectivity = { status: 'Pass', message: 'API endpoint reachable' };
    } catch (error) {
      results.tests.apiConnectivity = { status: 'Fail', message: error.message };
    }
    
    // Test 3: API key (if provided)
    if (apiKey) {
      try {
        await testApiKeyWithEndpoint(apiKey, 'gemini-1.5-pro');
        results.tests.apiKey = { status: 'Pass', message: 'API key is valid' };
      } catch (error) {
        results.tests.apiKey = { 
          status: 'Fail', 
          message: error.message,
          details: error.toString()
        };
      }
    } else {
      results.tests.apiKey = { status: 'Skip', message: 'No API key provided' };
    }
    
    // Display results
    resultsDiv.innerHTML = `
      <div class="test-results">
        <strong>Diagnostics Results:</strong>
        ${JSON.stringify(results, null, 2)}
      </div>
    `;
  });
  
  // Save other settings
  document.getElementById('save-settings').addEventListener('click', function() {
    const model = document.getElementById('model-select').value;
    const maxTokens = parseInt(document.getElementById('max-tokens').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const statusDiv = document.getElementById('settings-status');
    
    if (isNaN(maxTokens) || maxTokens < 1) {
      statusDiv.textContent = 'Max tokens must be a positive number';
      statusDiv.className = 'status error';
      return;
    }
    
    if (isNaN(temperature) || temperature < 0.1 || temperature > 1.0) {
      statusDiv.textContent = 'Temperature must be between 0.1 and 1.0';
      statusDiv.className = 'status error';
      return;
    }
    
    chrome.storage.local.set({ model, maxTokens, temperature }, function() {
      statusDiv.textContent = 'Settings saved successfully!';
      statusDiv.className = 'status success';
    });
  });
  
  // Close options page
  document.getElementById('close-options').addEventListener('click', function() {
    window.close();
  });
});

// Test API key with specific endpoint
async function testApiKeyWithEndpoint(apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: "Hello"
        }]
      }]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Test Error:', errorData);
    
    let errorMessage = 'API key test failed';
    if (errorData.error && errorData.error.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  return true;
}

// Test API key with v1 API
async function testApiKeyWithV1(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: "Hello"
        }]
      }]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Test Error:', errorData);
    
    let errorMessage = 'API key test failed';
    if (errorData.error && errorData.error.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  return true;
}
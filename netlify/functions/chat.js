// netlify/functions/chat.js - Debug Version
exports.handler = async (event) => {
  // Always return a proper JSON response
  try {
    console.log("Function started");
    
    // Check if it's a POST request
    if (event.httpMethod !== "POST") {
      console.log("Not a POST request:", event.httpMethod);
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method not allowed. Use POST." })
      };
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log("Request body parsed:", requestBody);
    } catch (e) {
      console.error("Failed to parse body:", e);
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON in request body" })
      };
    }

    const { messages } = requestBody;
    
    if (!messages) {
      console.error("No messages in request");
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing 'messages' in request body" })
      };
    }

    // Your API key - MAKE SURE THIS IS CORRECT
    const API_KEY = "AIzaSyBjme3M8azEhg1rG0o0aDQk41ax_LO4t5U";
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    console.log("Calling Gemini API...");
    
    // Make the call to Gemini
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    
    console.log("Gemini response status:", response.status);
    
    // Get the response text first
    const responseText = await response.text();
    console.log("Gemini response text:", responseText.substring(0, 200));
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", e);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Gemini returned invalid JSON", 
          rawResponse: responseText.substring(0, 500) 
        })
      };
    }
    
    // Check for API errors
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: data.error?.message || "Gemini API error",
          details: data
        })
      };
    }
    
    // Success!
    console.log("Successfully got response from Gemini");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error("Unhandled error in function:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: "Internal server error", 
        message: error.message,
        stack: error.stack 
      })
    };
  }
};

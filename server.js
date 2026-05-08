require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Ensure environment variables are loaded
if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key_here') {
    console.error("ERROR: Please configure your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the .env file.");
    process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const jsonPath = path.join(__dirname, 'cloudinary.json');

async function fetchAndSaveFiles() {
    try {
        // Fetch resources (Cloudinary typically stores audio files as 'video' resource type)
        const result = await cloudinary.api.resources({
            resource_type: 'video',
            max_results: 100, // adjust as needed
            direction: 'desc'
        });

        // The format should match what script.js expects: { resources: [...] }
        const data = {
            resources: result.resources
        };

        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(`[${new Date().toLocaleTimeString()}] Successfully updated cloudinary.json with ${result.resources.length} files.`);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Error fetching from Cloudinary:`, error.message);
    }
}

console.log("Starting Cloudinary Sync Server...");
console.log("NOTE: Polling is set to 10 seconds. Free tier allows 500 Admin API requests per hour.");

// Initial fetch
fetchAndSaveFiles();

// Poll every 10 seconds (10000 ms)
setInterval(fetchAndSaveFiles, 10000);

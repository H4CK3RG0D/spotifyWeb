// src/utils/handler.js
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    const routesPath = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

    routeFiles.forEach((file) => {
        const route = require(path.join(routesPath, file));

        console.log(`🔍 Checking ${file}:`, typeof route);

        if (typeof route !== 'function') {
            console.error(`❌ ERROR: ${file} does not export a valid Express router.`);
            return;
        }

        app.use('/api', route);
        console.log(`✅ Route Loaded: ${file}`);
    });

    console.log(`🚀 All ${routeFiles.length} routes processed.`);
};

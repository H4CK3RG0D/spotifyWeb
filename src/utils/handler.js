const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    const routesPath = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

    routeFiles.forEach((file) => {
        const route = require(path.join(routesPath, file));
        app.use('/api', route);
        console.log(`✅ Route Loaded: ${file}`);
    });

    console.log(`🚀 All ${routeFiles.length} routes loaded successfully.`);
};

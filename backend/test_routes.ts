import app from './src/app.js';
import listEndpoints from 'express-list-endpoints';

console.log('--- REGISTERED ROUTES ---');
const endpoints = listEndpoints(app);
endpoints.forEach(route => {
  console.log(`${route.methods.join(',')} ${route.path}`);
});
console.log('-------------------------');
process.exit(0);

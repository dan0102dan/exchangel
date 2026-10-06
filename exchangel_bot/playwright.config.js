import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'ui.spec.js',use:{baseURL:'http://127.0.0.1:5173',viewport:{width:390,height:844},locale:'en-US'},webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true}});

# Exchangel — Server Application Documentation

## Table of Contents

1. [Setup](#setup)
    1. [Configuration Guide](#configuration-guide)
    2. [Installation Guide](#installation)

2. [Application Structure](#application-structure)
    1. [Dependencies](#dependencies)
    2. [API](#api)
    3. [dataSync](#datasync)
    4. [db models](#db-models)
    5. [bot](#bot)

---

#### Description
The "server" directory houses the core server-side component of Exchangel. This component is responsible for serving as the backend infrastructure that handles data retrieval, authentication, and communication with the client-side application. It plays a pivotal role in ensuring the smooth functioning of the Exchangel web application.

## Setup

### Configuration Guide

**MongoDB Installation**

1. **Install MongoDB**: If you haven't already, install MongoDB on your system. You can download and install MongoDB Community Edition from the official website: [MongoDB Download Center](https://www.mongodb.com/try/download/community).

2. **Start MongoDB**: After installation, start the MongoDB service. The process to start MongoDB may vary depending on your operating system. Refer to the MongoDB documentation for specific instructions.

3. **Create a MongoDB Database**: Using a MongoDB client or the MongoDB shell, create a new database for your Exchangel application. You can choose any name you prefer, and it should be referenced in your configuration.

**Configuring MongoDB Connection in Your Application**

In [`db.ts`](./tools/db/db.ts), you'll need to configure the MongoDB connection to use the database you've created.

**Note**: Make sure to modify the `mongodb://...` to specify the URL of your MongoDB server and the name of the database you've created. If your server is running on a different host or port, adjust the URL accordingly.

In your Exchangel project, you will find a sample configuration file named `config.test.ts`. This file plays a crucial role in setting up your application by providing essential configuration data for your bot and integrating with the OKX API. Below, we'll guide you through the process of configuring these components.

### Bot Configuration

1. **BotFather Setup**:

   To configure your bot, you'll need to create a bot on Telegram and obtain its unique token. Here's how to do it:

   - Visit the [BotFather](https://t.me/BotFather) on Telegram.
   - Start a chat with the BotFather.
   - Use the `/newbot` command to create a new bot.
   - Follow the on-screen instructions to choose a name and username for your bot.
   - Once your bot is created, the BotFather will provide you with a unique API token. Copy this token for the next steps.

2. **Bot Configuration in `config.ts`**:

   Create the `config.ts` file in your project directory if it doesn't exist, and locate the `mainBot` section. You should see an object with `id` and `token` properties. Replace the values in this object with the information you obtained from the BotFather:

   ```typescript
   export const mainBot = {
       id: 1,                     // Replace with your bot's unique ID
       token: 'YOUR_BOT_TOKEN'    // Replace with your bot's API token
   }
   ```

   After making these changes, save the `config.ts` file.

### OKX API Key Setup

1. **Create OKX API Key**:

   To integrate with the OKX API, you need to create an API key on the OKX platform. Here's how to do it:

   - Visit the [OKX API Management](https://www.okx.com/account/my-api) page.
   - Log in to your OKX account.
   - Click on "Create API Key."
   - Follow the provided instructions to create an API key. You will be required to set an API key name and configure permissions for the key.

2. **API Key Configuration in `config.ts`**:

   In the `config.ts` file, you will need to create the `OKXAuth` section since it may not exist initially. Create this section and define an object with properties `apiKey`, `secretKey`, and `passkey`. Replace the placeholder values in this object with the information you received when creating your OKX API key:

   ```typescript
   export const OKXAuth = {
       apiKey: 'YOUR_API_KEY',       // Replace with your OKX API key
       secretKey: 'YOUR_SECRET_KEY', // Replace with your OKX secret key
       passkey: 'YOUR_PASSKEY'       // Replace with your OKX passkey
   }
   ```

   Once you have updated these values, save the `config.ts` file.

Your bot is now configured with the correct API token obtained from BotFather, and your OKX API key is set up to enable interactions with the OKX API. These configurations are essential for the smooth operation of your Exchangel application.

### Installation

1. Navigate to the "server" directory.
2. Install the necessary dependencies using `npm install`.

##### In Production Mode
Start the application with `npm start`. This will compile the TypeScript files and start the server in production mode.
   ```sh
   npm start
   ```

##### In Test Mode
To run the server in test mode, where certain checks like authorization may be bypassed or mocked, use the following command:
   ```sh
   npm run test
   ```

*Note: Test mode should only be used for development purposes and never in a production environment.*

[Back to Table of Contents](#table-of-contents)

---

## Application Structure

Exchangel's server-side component is structured to foster modularity and streamline essential functionalities. The architecture includes key components and modules that collectively power the application's core features.

### Dependencies

- `axios`: A promise-based HTTP client for making server requests.

- `koa`: A modern, fast web framework for Node.js that is widely used for building web applications and APIs.

- `koa-body`: Middleware for Koa that parses request bodies, including support for JSON, form data, and more.

- `koa-router`: A router middleware for Koa, which helps in defining routes and handling requests.

- `koa2-cors`: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Koa 2 applications, allowing your server to respond to requests from different origins.

- `koa2-ratelimit`: Middleware for rate limiting requests in Koa 2, helping to prevent abuse or overuse of your server resources.

- `mongoose`: An elegant MongoDB object modeling library for Node.js, providing a powerful and user-friendly way to interact with MongoDB databases. **Note: This dependency requires a configured MongoDB database for data storage.**

- `telegraf`: A modern Telegram bot framework for Node.js that simplifies the process of creating and managing Telegram bots.

### Development Dependencies

- `eslint`: A popular JavaScript and TypeScript linter that helps ensure code quality and adherence to coding standards.

- `typescript`: A superset of JavaScript that adds static typing to the language, enhancing code correctness and tooling support.

### Router Configuration

The heart of the Exchangel web application is the router, which is configured in the [`index.tsx`](./src/index.tsx) file. Here's an overview of its role and configuration:

- **Router Configuration**: The `createHashRouter` function from the `react-router-dom` library is used to create a router instance. It defines routes for different paths, such as the root path `'/'` and the path for cryptocurrency details `'/ccy/:instId'`. Each route is associated with a specific component to be rendered when the path is matched.

- **Rendering the Router**: The router is wrapped in a `RouterProvider` and rendered within the application's root element. This enables navigation within the application based on the defined routes.

- **BackButton Configuration**: The BackButton component from the Telegram WebApp is configured to handle navigation. It listens for clicks and uses the router to navigate back and forth between pages. Additionally, it hides the button when the user is on the root path to provide a seamless user experience.

[Back to Table of Contents](#table-of-contents)

---

## API

### Overview

[`app.ts`](./tools/app/app.ts) is a critical file in the Exchangel server-side codebase, serving as the main entry point for handling HTTP requests, setting up middleware, defining routes, and managing errors. This comprehensive guide will walk you through its functionality and how to set up and use it effectively.

### Initialization

In [`app.ts`](./tools/app/app.ts), we begin by initializing the necessary modules and dependencies required for our server application:

```typescript
import Koa from 'koa'
import Router from 'koa-router'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import { RateLimit } from 'koa2-ratelimit'
import { mainBot } from '../../config'
import { authorizeRequest } from './functions'
import { db } from '../../tools/index'

const app = new Koa()
const router = new Router()
```

- `app`: We create a new instance of the Koa application.
- `router`: We create a new instance of the Koa Router, which will be used to define our route handlers.

### CORS Middleware

CORS (Cross-Origin Resource Sharing) is handled by the CORS middleware:

```typescript
app.use(cors({ origin: '*' }))
```

- This middleware ensures that Cross-Origin requests are allowed, permitting data exchange from any source (`origin: '*'`).

### KoaBody Middleware

The KoaBody middleware processes data from the HTTP request body:

```typescript
app.use(koaBody())
```

- This middleware makes the data from the HTTP request body available for route handlers.

### Rate Limit Middleware

Rate limiting middleware is employed to control the number of requests from a single client:

```typescript
const limiter = RateLimit.middleware({
    interval: 1000,
    max: 5,
    message: 'Slow down'
})
app.use(limiter)
```

- This middleware restricts the number of requests per second (5 in this case) from a single client to prevent potential abuse.

### Authorization Middleware

Authorization middleware verifies the authenticity of incoming requests:

```typescript
app.use(async (ctx, next) => {
    const isAuthorized = authorizeRequest(ctx.headers.Authorization, mainBot.id, mainBot.token)

    if (isAuthorized) {
        await next()
    } else {
        ctx.status = 401
        ctx.body = 'Authorization failed'
    }
})
```

- This middleware checks the request's authorization headers and validates them based on the data from `mainBot` in the `config` file.
- If the request is authorized (`isAuthorized === true`), it proceeds to the next middleware; otherwise, it returns a 401 Unauthorized response.

### Routes

In [`app.ts`](./tools/app/app.ts), we define routes and their corresponding request handlers. These routes handle specific aspects of Exchangel's functionality.

- `/home`: This route handles GET requests to retrieve cryptocurrency data.
- `/getCcy`: Handles GET requests to fetch detailed cryptocurrency information.
- `/search`: Manages GET requests for searching cryptocurrencies.

### Error Handling

In the event of an error during request processing, the server responds with a structured error message and a 500 Internal Server Error HTTP status code:

```typescript
ctx.status = 500
ctx.body = { error: e.message }
```

- Errors are logged to the console for debugging purposes (`console.error(e)`).

[`app.ts`](./tools/app/app.ts) is the core of the Exchangel server, handling HTTP requests, setting up middleware, and defining routes. Understanding its structure and functionality is essential for effectively developing and maintaining the server-side of your application.

[Back to Table of Contents](#table-of-contents)

---

## dataSync

### Overview

[`dataSync.ts`](./tools/dataSync/dataSync.ts) is a critical module in the Exchangel server-side codebase, responsible for synchronizing cryptocurrency data from the OKX exchange. This comprehensive guide will walk you through its functionality and how to use it effectively.

### Data Synchronization Functions

#### Update Currency Data

The `updateCurrency` function retrieves information about available currencies from the OKX exchange and updates the database with this data. It performs the following tasks:

1. Fetches currency data from OKX API endpoint: `/api/v5/asset/currencies`.
2. Iterates through the retrieved data and updates the `Coin` collection in the database for each currency.
3. If the currency does not exist in the database, it creates a new record.

#### Search Trading Pairs

The `searchPair` function fetches trading pair data from the OKX exchange and updates the `Tickers` collection in the database. Its steps include:

1. Fetching trading pair data from the OKX API endpoint: `/api/v5/public/instruments` with the parameter `instType` set to `'SPOT'`.
2. Mapping each trading pair to its corresponding base and quote currencies in the `Coin` collection in the database.
3. Updating the `Tickers` collection with the trading pair data.
4. Creating new records for trading pairs that do not exist in the database.

#### Update Market Data

The `updateData` function synchronizes market data, including price and trading volume, from the OKX exchange. Its workflow is as follows:

1. Fetching market data from the OKX API endpoint: `/api/v5/market/tickers` with the parameter `instType` set to `'SPOT'`.
2. Updating the `Tickers` collection in the database with the fetched market data.

#### Automated Data Update

The `updater` function orchestrates the automated synchronization of data. It combines the three data synchronization functions mentioned above and runs them at specified intervals.

In case of any errors encountered during data synchronization, the error is logged to the console:

```typescript
console.error(e.message)
```

### Usage

To utilize [`dataSync.ts`](./tools/dataSync/dataSync.ts) effectively, follow these steps:

1. Import `updater` from `dataSync.ts` into your server application.
2. Configure the desired synchronization interval (in milliseconds) for regular data updates.

```typescript
// Example usage
import updater from './dataSync'

// Define the synchronization interval (e.g., every 5 minutes)
const synchronizationInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

// Start the updater with the defined interval
updater(synchronizationInterval);
```

### Conclusion

[`dataSync.ts`](./tools/dataSync/dataSync.ts) plays a crucial role in keeping your Exchangel server up-to-date with cryptocurrency data from the OKX exchange. Understanding its functions and automated data update process is vital for maintaining accurate and timely information.

[Back to Table of Contents](#table-of-contents)

---

## db models

### 1. Coin Model ([`Coin.ts`](./tools/db/models/Coin.ts))

The `Coin` model represents information about individual cryptocurrencies, including their currency code (`ccy`), name, and a link to their logo. This model is used to store and manage data related to cryptocurrencies.

### 2. Tickers Model ([`Tickers.ts`](./tools/db/models/Tickers.ts))

The `Tickers` model stores data related to trading pairs and their market performance, such as prices, trading volume, and other relevant information. It's designed to provide real-time data for various trading pairs.

### 3. Users Model ([`Users.ts`](./tools/db/models/Users.ts))

The `Users` model is responsible for storing user-related data, particularly user IDs. It is used to manage user information and interactions within the application.

These models help organize and manage the data within the Exchangel server application. They provide a structured and efficient way to store and retrieve information related to cryptocurrencies, trading pairs, and user data.

## Bot

The [`bot.ts`](./tools/bot/bot.ts) file contains the configuration and setup for the Exchangel bot, which is responsible for interacting with users on the Telegram platform.

### Bot Initialization:

- `Telegraf` is used to create a new bot instance.
- The bot token is obtained from the `mainBot` configuration in the `config` file.

### Middleware and User Context:

- The bot uses middleware to process incoming messages and commands.
- It checks if the sender is a valid user (not a bot) and retrieves the user's ID.
- The `User` class from the `classes` directory is used to manage user data.

### Command Handling:

- The bot listens for the `/start` command and responds with a welcome message.
- The `helloMes` function is assigned as the response to the `/start` command.

### Welcome Message:

- When a user sends the `/start` command, the bot responds with a friendly "Hello" message.
- The message is formatted in HTML and includes an inline keyboard.

### Inline Keyboard:

- An inline keyboard is created using the `Markup.inlineKeyboard` function from the Telegraf library.
- The keyboard contains a single button labeled "MiniApp" with a link to the Exchangel Mini App.

This setup ensures that when users start a conversation with the bot by sending the `/start` command, they receive a welcoming message with a convenient link to the Exchangel Mini App.

[Back to Table of Contents](#table-of-contents)

---
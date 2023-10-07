# Exchangel — Web Application Documentation

## Table of Contents

1. [Setup](#setup)
    1. [Configuration Guide](#configuration-guide)
    2. [Installation Guide](#installation)

2. [Application Structure](#application-structure)
    1. [Dependencies](#dependencies)
    2. [Router Configuration](#router-configuration)
    3. [Component Structure](#component-structure)
    4. [Routes Directory](#routes-directory)

3. [Description of pages](#description-of-pages)
    1. [Root](#root-page)
    2. [Swap](#swap-page)
    3. [ErrorPage](#errorpage)

---

#### Description
The "web" directory contains the front-end component of Exchangel. It provides a user-friendly interface for collecting cryptocurrency data and calculating their value.

### Setup

#### Configuration Guide

To configure the front-end component of Exchangel (located in the "web" directory), follow these steps:

1. Open the [`web/src/API.ts`](./src/API.ts) file.
2. Update the `baseURL` variable to the appropriate server URL. For local development with the default server port (49300), set it to `http://localhost:49300`.

```typescript
import axios from 'axios'

export const server = axios.create({
    baseURL: 'https://exchangel.dan0102dan.ru', // update this baseURL
    headers: {
        Authorization: (window as any).Telegram.WebApp.initData
    }
})
```

By following these steps, you will configure the front-end component to communicate with the desired server.

#### Installation
1. Navigate to the "web" directory.
2. Install the necessary dependencies using `npm install`.
3. Start the web application with `npm start`.

[Back to Table of Contents](#table-of-contents)
---

### Application Structure

Exchangel's web application is structured in a way that promotes modularity and ease of navigation. It includes key components such as the router, components, and routes.

#### Dependencies

Exchangel's front-end component relies on the following dependencies:

- `axios`: A promise-based HTTP client for making server requests.
- `react` and `react-dom`: JavaScript libraries for building user interfaces.
- `react-router-dom`: A library for routing within React applications.
- `typescript`: A superset of JavaScript that adds static typing to the language.

#### Router Configuration

The heart of the Exchangel web application is the router, which is configured in the [`index.tsx`](./src/index.tsx) file. Here's an overview of its role and configuration:

- **Router Configuration**: The `createHashRouter` function from the `react-router-dom` library is used to create a router instance. It defines routes for different paths, such as the root path `'/'` and the path for cryptocurrency details `'/ccy/:instId'`. Each route is associated with a specific component to be rendered when the path is matched.

- **Rendering the Router**: The router is wrapped in a `RouterProvider` and rendered within the application's root element. This enables navigation within the application based on the defined routes.

- **BackButton Configuration**: The BackButton component from the Telegram WebApp is configured to handle navigation. It listens for clicks and uses the router to navigate back and forth between pages. Additionally, it hides the button when the user is on the root path to provide a seamless user experience.

#### Component Structure

The Exchangel web application maintains a modular component structure within the ["Components"](./src/Components/) directory. The component structure is structured as follows:

- **Components Directory**: This directory contains reusable components utilized across the application. Each component is structured within its dedicated folder, encompassing both JSX and CSS files.

#### Routes Directory

The "routes" directory contains all the pages of the application. Each page is represented by a separate file that defines the component for that page. Here are some key pages and their roles:

- **Root Page**: The [`Root`](./src/routes/Root/Root.jsx) page serves as the main landing page of the application. It is responsible for displaying cryptocurrency data and handling user interactions, such as searching and navigating to cryptocurrency details.

- **Swap Page**: The [`Swap`](./src/routes/Swap/Swap.jsx) page is associated with the `'/ccy/:instId'` route and is responsible for displaying detailed information about a selected cryptocurrency. Users can navigate to this page by clicking on a cryptocurrency entry on the `Root` page.

- **Error Page**: The [`ErrorPage`](./src/routes/ErrorPage/ErrorPage.jsx) page is designed to handle unexpected errors that may occur during application usage. It provides users with error information and allows them to restart the application. This page is essential for improving user experience by gracefully handling errors.

This modular organization of components and pages allows for easy development, maintenance, and scalability of the Exchangel web application. Developers can focus on building and enhancing individual components and pages while ensuring a consistent and organized codebase.

[Back to Table of Contents](#table-of-contents)
---

### Description of pages

---

### Root

The [`Root`](./src/routes/Root/Root.jsx) page is a central component in the Exchangel web application. It serves as the main landing page for users to interact with cryptocurrency data and search for information. This documentation will provide an overview of how the `Root` page functions and interacts with various components.

### Component Structure

- **Search Component**: At the top of the page, the `Search` component allows users to input a query for searching cryptocurrency data. It provides a real-time search feature by updating the query as users type.

- **Data Loading Handling**: The `Root` page efficiently handles data loading and displaying various placeholders to keep users informed about the current status:
  - **Loading Placeholder**: When the page is initially loaded, a loading placeholder with a search icon (`🔍`) is displayed as the basic information is retrieved from the server.
  - **Search Placeholder**: When users enter a search query, different placeholders are shown based on the search results:
    - If no results are found and data is still being fetched, a placeholder with the title "Searching..." and a description ("Looking for information on the server.") is displayed with an eye icon (`👀`).
    - If no results are found after fetching, a placeholder with the title "Empty" and a description ("Unfortunately, nothing was found.") is displayed with a sad face icon (`😔`).
    - If search results are found, they are mapped to `Cell` components for display.
  - **Basic Data Loading Placeholder**: When the page is initially loaded, but no data is retrieved, a placeholder with the title "Empty" and a description ("Unfortunately, nothing was found.") is displayed with a reload button.

- **Data Retrieval**: The `Root` page retrieves cryptocurrency data from the server when it is initially loaded. This data is organized into sections based on the provided information. Each section contains `Cell` components that display cryptocurrency information.

- **Cell Component**: The `Cell` component represents individual cryptocurrency data entries. It provides the following information:
  - Icon: The cryptocurrency's logo.
  - Title: The cryptocurrency's identifier.
  - Subtitle: The base and quote currency names.
  - Info1: The last known price.
  - Info2: The change in value in the last 24 hours.
  - Info3: The percentage change in the last 24 hours.
  - Type: Indicates whether the price increased (`+`), decreased (`-`), or remained unchanged.

- **Navigation**: Users can click on a `Cell` component to navigate to a detailed view of the selected cryptocurrency, where more information is available.

### Functionality

- **Initial Data Loading**: When the `Root` page is accessed, it initially attempts to retrieve basic cryptocurrency data from the server. A loading placeholder with a search icon (`🔍`) is displayed during this process. If data is successfully retrieved, it is organized into sections.

- **Search**: Users can input a search query using the `Search` component. As they type, the `setDebounceInput` function is used to manage real-time debouncing and update the search results. Placeholders are displayed to indicate the search status: searching (`👀`), empty results (`😔`), or found results.

- **Data Fetching**: When a search query is entered, the `searchData` function fetches data from the server based on the query. The fetched results are displayed as `Cell` components.

- **Navigation**: Users can click on a `Cell` component to navigate to a detailed view of the selected cryptocurrency, with its additional information displayed.

### Data Dependencies

The `Root` page relies on data retrieved from the server, specifically from the `/home` endpoint for basic information and the `/search` endpoint for search results.

### Error Handling

- **Server Errors**: If there are any errors when fetching data from the server (e.g., network issues or server unavailability), error handling is implemented to prevent application crashes. Errors are logged to the console.

### Code Reusability

- The code for the `Root` page is designed to be modular and reusable, making it a valuable example for developers building Mini Apps for Telegram.

[Back to Table of Contents](#table-of-contents)
---

### Swap Page

The [`Swap`](./src/routes/Swap/Swap.jsx) page within the Exchangel web application is dedicated to providing users with detailed information about a selected cryptocurrency, facilitating seamless exchanges, and enhancing user interaction with cryptocurrency data. Below is a comprehensive overview of the page's components and functionality:

### Component Structure

- **Cryptocurrency Data Display**: The core functionality of the `Swap` page revolves around displaying comprehensive information about the selected cryptocurrency. Users can expect to find detailed data such as the cryptocurrency's name, symbol, current price, 24-hour high and low, trading volume, and more.

- **Input Fields for Conversion**: To empower users with the ability to perform cryptocurrency exchanges, the page features two input fields: one for the base currency and one for the quote currency.

- **MiniCell Components**: MiniCell components are used to display the logos and names of the base and quote currencies, providing users with a visual reference for the selected cryptocurrencies.

- **HorizontalList and ProgressBar for Additional Information**: The `Swap` page incorporates a horizontal list of InfoBlock components to present supplementary cryptocurrency data. This information encompasses details such as the most recent price, the highest and lowest price points observed in the last 24 hours, and the 24-hour trading volume. Additionally, a `ProgressBar` component is utilized to provide visual feedback and progress indication when necessary.

- **Loading Handling**: To maintain a user-friendly experience, the page incorporates loading placeholders that inform users about the ongoing data retrieval process. These placeholders ensure users are aware of the current status, whether data is still being fetched, or the page is ready for interaction.

### Functionality

- **Cryptocurrency Data Retrieval**: Upon accessing the `Swap` page, the selected cryptocurrency's data is fetched from the server. This data includes real-time information about the cryptocurrency's performance, such as the current price, 24-hour high and low, and trading volume.

- **Conversion Functionality**: Users can utilize the two input fields for conversion purposes. Entering an amount in one field will automatically calculate and update the equivalent amount in the other field based on the current cryptocurrency rate. This feature simplifies the process of planning cryptocurrency exchanges.

### Data Dependencies

The `Swap` page relies on data fetched from the server, specifically from the `/getCcy` endpoint, to provide real-time cryptocurrency information for the selected cryptocurrency.

### Error Handling

- **Server Errors**: The `Swap` page is equipped with error handling capabilities to gracefully manage situations where data retrieval from the server encounters issues. These errors are logged to the console for debugging purposes.

### Code Reusability

- The code for the `Swap` page is designed to be modular and reusable, adhering to the principles of code efficiency and maintainability. Developers can draw inspiration from this page when building similar features in their Mini Apps.

[Back to Table of Contents](#table-of-contents)
---

### ErrorPage

The `ErrorPage` within the Exchangel web application serves as a vital component for handling unexpected errors gracefully. It ensures that users receive clear error messages and provides an option to restart the application to recover from errors. Here's an overview of its components and functionality:

### Component Structure

- **Error Message**: The central component of the `ErrorPage` is the error message, which conveys detailed information about the encountered error. This message may include the error status, a custom error description, or any relevant error details.

- **Restart Button**: To facilitate user recovery from errors, the `ErrorPage` includes a restart button. Users can click this button to reload the application, providing an opportunity to potentially resolve the error.

### Functionality

- **Error Handling**: When an unexpected error occurs within the application, the `ErrorPage` is displayed to users. It presents a clear error message that describes the nature of the error, helping users understand what went wrong.

- **Restart Option**: To offer a solution to users, the page features a restart button. Clicking this button reloads the application, offering users a quick way to potentially recover from the error and continue using the application.

### Data Dependencies

The `ErrorPage` primarily relies on error information provided by the application when an unexpected error occurs.

[Back to Table of Contents](#table-of-contents)
---
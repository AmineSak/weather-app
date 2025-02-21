# Weather Globe Project

## Overview

The Weather Globe project is a web application built using **Next.js**, a popular React framework that enables server-side rendering and static site generation. This application provides an interactive globe interface that displays real-time weather data based on user-selected locations. Users can click on the globe to retrieve weather information for specific coordinates, making it an engaging way to visualize weather patterns around the world.

### Key Features

- **Interactive Globe**: Users can click on different locations on the globe to fetch and display weather data.
- **Real-time Weather Data**: The application retrieves current weather information from an external API based on the selected coordinates.
- **Responsive Design**: The application is designed to be responsive, ensuring a good user experience on various devices.

## Project Structure

The project consists of several key files and directories:

- **`app/`**: Contains the main application code, including pages and components.

  - **`layout.tsx`**: Defines the root layout of the application, including metadata and global styles.
  - **`page.tsx`**: The main page of the application that renders the interactive globe component.
  - **`api/weather/route.js`**: An API route that handles requests for weather data based on latitude and longitude.
  - **`components/GlobeWeather.js`**: The component that renders the globe and handles user interactions to fetch weather data.

- **`public/`**: (Not shown in the snippets) Typically contains static assets like images and icons.

- **`styles/`**: Contains global styles defined in `globals.css`, which uses Tailwind CSS for styling.

- **`next.config.ts`**: Configuration file for Next.js.

- **`package.json`**: Lists project dependencies and scripts for running the application.

- **`tsconfig.json`**: TypeScript configuration file.

## Technologies Used

- **Next.js**: Framework for building server-rendered React applications.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Weatherstack API**: External API used to fetch weather data.

## Getting Started

To run the Weather Globe project locally, follow these steps:

### Prerequisites

- Ensure you have **Node.js** (version 14 or later) installed on your machine.
- You will also need **npm** (Node Package Manager), which comes with Node.js.

### Installation

1. **Clone the Repository**:
   Open your terminal and run the following command to clone the project repository:

   ```bash
   git clone <repository-url>
   cd weather-globe
   ```

2. **Install Dependencies**:
   Navigate to the project directory and install the required dependencies:

   ```bash
   npm install
   ```

### Running the Application

1. **Start the Development Server**:
   In the terminal, run the following command to start the Next.js development server:

   ```bash
   npm run dev
   ```

2. **Open in Browser**:
   Once the server is running, open your web browser and navigate to `http://localhost:3000` to view the application.

### Testing the Application

- Click on different locations on the globe to see the weather data for those coordinates.

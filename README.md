# Credify - Certificate Generator Web App Backend

Credify is a  application for a certificate generator web application. This repo provides APIs for managing certificates, handling CSV file uploads, and interacting with a MongoDB database.

Endpoint URL: `https://credify-server.onrender.com/`

## Installation and Setup

1. Clone this repository to your local machine.
2. Install dependencies by running `npm install`.
3. Configure environment variables by creating a `.env` file in the root directory with the following contents:

   MONGODB_URI=<your_mongodb_uri>
   MONGODB_NAME=<your_database_name>
   MONGODB_COLLECTION=<your_collection_name>

4. Start the server by running `npm start`.
5. The server will be running on port 3000 by default.

## Features

- **Certificate Management:** Allows users to add, retrieve, and search for certificates in the database.
- **CSV File Handling:** Provides functionality to upload CSV files containing certificate data and process them for insertion into the database.

## API Documentation

### 1. Check Status

- **URL:** `/status`
- **Method:** `GET`
- **Description:** Checks the connection status to the database.
- **Response:**
  - `connected`: Boolean indicating database connection status.

### 2\. Get Certificate by ID

- **URL:** `/cert/:id`
- **Method:** `GET`
- **Description:** Retrieves a certificate by its unique ID.
- **Parameters:**
  - `id`: Unique identifier of the certificate.
- **Response:**
  - `cert`: Certificate object.
- **Error Response:**
  - Status: 404 Not Found
  - Body: `{ error: "Certificate not found" }`

### 3\. Add Certificate

- **URL:** `/cert`
- **Method:** `POST`
- **Description:** Adds a new certificate to the database.
- **Request Body:**
  - Certificate object
- **Response:**
  - Newly added certificate object with generated ID.
- **Error Response:**
  - Status: 500 Internal Server Error
  - Body: `{ error: "Internal Server Error" }`

### 4\. Upload CSV File

- **URL:** `/uploads`
- **Method:** `POST`
- **Description:** Uploads a CSV file containing certificate data and processes it.
- **Request Body:**
  - Form data with a field named `csvFile` containing the CSV file.
- **Response:**
  - Status: 201 Created
  - Body: `File uploaded and processed successfully`
- **Error Response:**
  - Status: 400 Bad Request
  - Body: `No CSV file uploaded`
  - Status: 500 Internal Server Error
  - Body: `An error occurred while uploading the file`

### 5\. Get Certificates by Event Club

- **URL:** `/certs/club/:event_club`
- **Method:** `GET`
- **Description:** Retrieves certificates belonging to a specific event club.
- **Parameters:**
  - `event_club`: Name of the event club.
- **Response:**
  - Array of certificate objects.
- **Error Response:**
  - Status: 404 Not Found
  - Body: `{ error: "Certificates not found" }`
  - Status: 500 Internal Server Error
  - Body: `{ error: "Server Error During fetching Club wise Certificates." }`

## Files

### 1\. `app.js`

- Main entry point of the application.
- Configures Express server, defines routes, and handles middleware.

### 2\. `database.js`

- Handles database connection and provides functions for database operations such as inserting and finding certificates.

### 3\. `csvHandler.js`

- Provides functions for handling CSV files, including reading, validating, and uploading them.

### 4\. `mailHandler.js`

- Handles bulk mail sendnig functionality for each recipient.

## Dependencies

- Node.js
- Express.js
- MongoDB
- Multer
- CSV Parser
- Mailgun.js
- Prisma
- dotenv

## Things to do in Future

- [x] Add API functionality to upload CSV file.
- [x] Validate Uploaded CSV file.
- [x] Containerize the API.
- [ ] Add Docker Compose File to Integrate Database into a API Container itself.
- [x] Add Prisma with PostgreSQL for Backup and Redundancy.
- [x] Write Tests for API &  Integrate it with Github Actions CICD.
- [x] Add Bulk Email Sending Functionality.
- [ ] Create an Email Template for recipient receiving new Certificate.

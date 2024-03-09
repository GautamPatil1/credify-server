const { MongoClient, ObjectId } = require("mongodb"); // Importing required modules from MongoDB package
require("dotenv").config(); // Importing dotenv to load environment variables from a .env file
const { PrismaClient } = require("@prisma/client");
const {sendMail} = require("./mailHandler");

// Retrieving MongoDB URI, database name, and collection name from environment variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;

const client = new MongoClient(uri); // Creating a new MongoClient instance
const prisma = new PrismaClient(); // Creating a new PrismaClient instance

/**
 * Connects to the MongoDB server and returns the specified collection object.
 * @returns {Promise} A promise that resolves to the collection object.
 * @throws {Error} If an error occurs during the connection process.
 */
async function connectDatabase() {
  try {
    await client.connect(); // Connecting to the MongoDB server
    console.log("Connected to the database");
    return client.db(dbName).collection(collectionName); // Returning the specified collection object
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // Propagating the error if connection fails
  }
}

let collection; // variable to store database collection
let connected = false; // variable to store database connection status

/**
 * Initializes the database connection and sets the `collection` and `connected` variables.
 */
connectDatabase()
  .then((dbCollection) => {
    collection = dbCollection;
    connected = true;
  })
  .catch((error) => {
    console.error("Error initializing database connection:", error);
    process.exit(1); // Exit the application if unable to connect to the database
  });

/**
 * Inserts a certificate into the database.
 * @param {Object} cert - The certificate to insert.
 * @returns {Promise} A promise that resolves to the result of the insert operation.
 * @throws {Error} If an error occurs during the insert operation.
 */
async function insertCert(cert) {
  try {
    // Adding the current date to the certificate
    cert.issuedDate = new Date();

    // Inserting the certificate into the MongoDB collection
    const result = await collection.insertOne(cert);
    
    // Using MongoDB generated id as the id for Prisma certificate
    const db = await prisma.certificate.create({
      data: {
        id: result.insertedId.toString(),
        name: cert.name,
        email: cert.email,
        event_name: cert.event_name,
        event_description: cert.event_description,
        event_date: cert.event_date,
        event_branch: cert.event_branch,
        event_club: cert.event_club,
        issued_date: new Date(), // Using the current date/time
      },
    });

    // Logging and returning the result
    console.log("Certificate inserted successfully.\n");

    //sendMail(cert);  // Remove comment during production to send mails.
    //console.log("Certificate sent to the recipient via mail.\n")

    return result;
  } catch (error) {
    // Error handling
    console.error("Failed to insert certificate:", error);
    throw new Error("Failed to insert certificate", error); // Throwing a new error to provide a more informative message
  }
}

/**
 * Finds a certificate in the database by its ID.
 * @param {string} id - The ID of the certificate to find.
 * @returns {Promise} A promise that resolves to the certificate, if found.
 * @throws {Error} If an error occurs during the find operation.
 */
async function findCert(id) {
  try {
    const result = await collection.findOne({ _id: new ObjectId(id) });
    console.log("Certificate found successfully.");
    return result;
  } catch (error) {
    console.error(`Failed to find certificate: ${error}`);
    throw error;
  }
}

/**
 * Finds certificates in the database that match a given query.
 * @param {Object} query - The query to use when searching for certificates.
 * @returns {Promise<Array>} A promise that resolves to an array of certificates that match the query.
 * @throws {Error} If an error occurs during the find operation.
 */
async function findCerts(query) {
  try {
    const result = await collection.find(query).toArray();
    console.log("Certificates found successfully.");
    return result;
  } catch (error) {
    console.error(`Failed to find certificates: ${error}`);
    throw error;
  }
}

async function main(cert) {
  const user = await prisma.certificate.create({
    data: cert,
  });
  console.log(user);
}

/**
 * Checks if the application is connected to the database.
 * @returns {boolean} True if the application is connected to the database, false otherwise.
 */
function isConnected() {
  return connected;
}

// Exporting connectDatabase function and ObjectId for external use
module.exports = {
  insertCert,
  findCert,
  isConnected,
  findCerts,
};

const { MongoClient, ObjectId } = require("mongodb"); // Importing required modules from MongoDB package
require("dotenv").config(); // Importing dotenv to load environment variables from a .env file

// Retrieving MongoDB URI, database name, and collection name from environment variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;

const client = new MongoClient(uri); // Creating a new MongoClient instance

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
async function insertCert(cert){
  try {
    cert.issuedDate = new Date(); // Adding the current date to the certificate
    const result = await collection.insertOne(cert); // Inserting the certificate into the database
    console.log("Certificate inserted successfully.")
    return result;
  } catch (error) {
    console.error(`Failed to insert certificate: ${error}`);
    throw error;
  }
}

/**
 * Finds a certificate in the database by its ID.
 * @param {string} id - The ID of the certificate to find.
 * @returns {Promise} A promise that resolves to the certificate, if found.
 * @throws {Error} If an error occurs during the find operation.
 */
async function findCert(id){
  try {
    const result = await collection.findOne({ _id: new ObjectId(id) });
    console.log("Certificate found successfully.")
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
async function findCerts(query){
  try{
    const result = await collection.find(query).toArray();
    console.log("Certificates found successfully.")
    return result;
  } catch(error){
    console.error(`Failed to find certificates: ${error}`);
    throw error;
  }
}

/**
 * Checks if the application is connected to the database.
 * @returns {boolean} True if the application is connected to the database, false otherwise.
 */
function isConnected(){
  return connected;
}

// Exporting connectDatabase function and ObjectId for external use
module.exports = {
  insertCert, findCert, isConnected, findCerts
};

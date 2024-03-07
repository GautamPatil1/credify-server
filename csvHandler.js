const multer = require("multer");
const csv = require("csv-parser");
const { insertCert } = require("./database");
const fs = require("fs");

/**
 * Reads a CSV file and inserts its content into the database.
 * @param {string} file - The path to the CSV file.
 * @throws {Error} If an error occurs during the read or insert operations.
 */
async function csvToDatabase(file) {
  const results = []; // Array to store the CSV data

  // Read the CSV file and insert data into the database
  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const result of results) {
            await insertCert(result); // insert the Certificate into the database
          }
          // Delete the file after processing
          fs.unlink(file, (err) => {
            if (err) {
              console.error(`${file} deletion failed:`, err);
              reject(err);
            }
            console.log(`${file} was deleted`);
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error reading CSV:", error);
        reject(error);
      }); // Handle read stream errors
  });
}

/**
 * Validates a CSV file to ensure it adheres to specified column requirements.
 * @param {string} filePath - The path to the CSV file to validate.
 * @returns {Promise<void>} A promise that resolves if the CSV is valid or rejects with an error message.
 */
function validateCSV(filePath) {
  // Define required and optional columns
  const requiredColumns = [
    "name",
    "email",
    "event_name",
    "event_description",
    "event_date",
  ];
  const optionalColumns = ["event_branch", "event_club"];

  // Initialize validation flags and error message
  let isValid = true;
  let errorMessage = "";

  // Return a promise for asynchronous validation
  return new Promise((resolve, reject) => {
    // Create a readable stream for the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headers) => {
        // Check if required columns exist
        for (const column of requiredColumns) {
          if (!headers.includes(column)) {
            isValid = false;
            errorMessage = `Missing required column: ${column}. \n`;
            break;
          }
        }

        // Check if there are any unexpected additional columns
        const allColumns = headers.concat(optionalColumns);
        for (const column of allColumns) {
          if (
            !requiredColumns.includes(column) &&
            !optionalColumns.includes(column)
          ) {
            isValid = false;
            errorMessage += `Unexpected column: ${column}.\n `;
            break;
          }
        }
      })
      .on("data", (data) => {
        // Check for missing values in required columns
        for (const column of requiredColumns) {
          if (!data[column]) {
            isValid = false;
            errorMessage += `Missing value in column '${column}' for row: ${JSON.stringify(
              data
            )}.\n `;
            break;
          }
        }
      })
      .on("end", () => {
        // Resolve the promise if the CSV is valid, otherwise reject with an error message
        if (isValid) {
          resolve();
        } else {
          reject(errorMessage);
        }
      })
      .on("error", (error) => {
        // Reject the promise if there's an error reading the CSV
        reject(`Error reading CSV: ${error}`);
      });
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, csvToDatabase, validateCSV };

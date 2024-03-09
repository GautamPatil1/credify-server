const express = require("express");
const cors = require("cors");
const { insertCert, findCert, isConnected, findCerts } = require("./database");
const { upload, csvToDatabase, validateCSV } = require("./csvHandler");

// Initial Configuration
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// ROUTES

// Route to check if connected to the database
app.get("/status", (req, res) => {
  res.json({ connected: isConnected() });
});

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Route to Get data from database
app.get("/cert/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const cert = await findCert(id);
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    res.json(cert);
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to Add data to database
app.post("/cert", async (req, res) => {
  try {
    const {
      name,
      email,
      event_name,
      event_description,
      event_date,
      event_club,
      event_branch,
    } = req.body;

    // Validate required fields
    if (!name || !email || !event_name || !event_description || !event_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure no extra fields are present
    const allowedFields = [
      "name",
      "email",
      "event_name",
      "event_description",
      "event_date",
      "event_club",
      "event_branch",
    ];
    const extraFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );
    if (extraFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Unexpected fields: ${extraFields.join(", ")}` });
    }

    // Create certificate object with validated fields
    const cert = {
      name,
      email,
      event_name,
      event_description,
      event_date,
      event_club,
      event_branch,
    };

    const result = await insertCert(cert);
    res.status(201).json({ ...cert, _id: result.insertedId });
  } catch (error) {
    console.error("Error adding certificate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle CSV file uploads
app.post("/uploads", upload.single("csvFile"), (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      console.log("No file to upload");
      return res.status(400).json({"msg": "No CSV file uploaded"});
    }

    // Extract file path from the request
    const filepath = req.file.path;
    validateCSV(filepath)
      .then(async () => {
        await csvToDatabase(filepath);
        res.status(201).json({"msg": "File uploaded and processed successfully"});
      })
      .catch((error) => {
        console.error("Error validating CSV:", error);
        res.status(400).json({"msg": "No CSV file uploaded", "error": error});
      });
  } catch (error) {
    // Handle any errors that occur during file upload
    console.error("Error uploading file:", error);
    res.status(500).json({"msg": "An error occurred while uploading the file.", "error": error});
  }
});

// Route to Get certificates by event_club
app.get("/certs/club/:event_club", async (req, res) => {
  try {
    const query = { event_club: req.params.event_club };
    const certs = await findCerts(query);
    if (!certs.length) {
      return res.status(404).json({ error: "Certificates not found" });
    }
    res.json(certs);
  } catch (error) {
    console.error("Error fetching Club wise certificates:", error);
    res
      .status(500)
      .json({ error: "Server Error During fetching Club wise Certificates." });
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

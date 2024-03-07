const express = require("express");
const cors = require("cors");
const {insertCert, findCert, isConnected, findCerts} = require("./database");
const { upload, csvToDatabase, validateCSV} = require("./csvHandler");

// Initial Configuration
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// ROUTES

// Route to check if connected to the database
app.get("/status", (req, res) => {
    res.json({ "connected": isConnected() });
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
    const cert = req.body;
    const result = await insertCert(cert);
    res.status(201).json({ ...cert, _id: result.insertedId });
  } catch (error) {
    console.error("Error adding certificate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle CSV file uploads
app.post('/uploads', upload.single('csvFile'), (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            console.log("No file to upload");
            return res.status(400).send('No CSV file uploaded');
        }

        // Extract file path from the request
        const filepath = req.file.path;
        validateCSV(filepath)
            .then(async () => {
                await csvToDatabase(filepath);
                res.status(201).send('File uploaded and processed successfully');
            })
            .catch((error) => {
                console.error("Error validating CSV:", error);
                res.status(400).send(error);
            });
    } catch (error) {
        // Handle any errors that occur during file upload
        console.error('Error uploading file:', error);
        res.status(500).send('An error occurred while uploading the file: ', error);
    }
});

// Route to Get certificates by event_club
app.get('/certs/club/:event_club', async (req, res) => {
    try {
        const query = { event_club: req.params.event_club };
        const certs = await findCerts(query);
        if (!certs.length) {
            return res.status(404).json({ error: "Certificates not found" });
        }
        res.json(certs);

    } catch (error) {
        console.error("Error fetching Club wise certificates:", error);
        res.status(500).json({ error: "Server Error During fetching Club wise Certificates." });
    }
})

// Route to Get certificates by event_name
app.get('/certs/club/:club_name/event/:event_name', async (req, res) => {
    try {
        const query = { club_name: req.params.club_name, event_name: req.params.event_name };
        const certs = await findCerts(query);
        if (!certs.length) {
            return res.status(404).json({ error: "Certificates not found" });
        }
        res.json(certs);

    } catch (error) {
        console.error("Error fetching Event wise certificates:", error);
        res.status(500).json({ error: "Server Error During fetching Event wise Certificates." });
    }
})


// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


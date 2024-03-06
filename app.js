//libraries 
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

//setup 
const PORT = process.env.PORT || 3000;
const app = express();
const uri = process.env.MONGODB_URI;

//middleware
app.use(express.json());
app.use(cors( ));

//database connection
const client = new MongoClient(uri);
client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });


//routes
app.get('/', (req, res) => {
    res.json(g);
})

//get data from database
app.get('/cert/:certId', async (req, res) => {
    try {
      const certId = req.params.certId;
      const cert = await client
        .db('credify')
        .collection('credify-data')
        .find({ certId })
        .toArray();
  
      res.json(cert);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//add data in database
app.post('/cert', async (req, res) => {
    try {
      const cert = req.body;
      const certId = cert.certId;
      
      // Ensure userId is included in the request body
      if (!certId) {
        return res.status(400).json({ error: 'certId is required in the request body' });
      }

      const result = await client
        .db('credify')
        .collection('credify-data')
        .insertOne(cert);
  
      res.status(201).json({ ...cert, _id: result.insertedId }); // Return the inserted todo with its generated _id
    } catch (error) {
      console.error('Error adding Certificate:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/', (req, res) => {
    const data = req.body;
    console.log(data);
    res.json({"Response": data});
    
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
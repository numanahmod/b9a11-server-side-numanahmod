const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// console.log(process.env.DB_PASS);


const corsOptions = {
    origin: ['http://localhost:5173','http://localhost:5174'],
    Credential: true,
    optionSuccessStatus: 200,
}

//Middleware 

app.use(cors(corsOptions));
app.use(express.json());

// mongodb 



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1vvlral.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const jobsCollection = client.db('postJobsDB').collection('postedJobs')
    const applyCollection = client.db('postJobsDB').collection('appliedJobs')
    // get all jobs data from db 
    app.get('/postedJobs', async(req, res) =>{
        const result = await jobsCollection.find().toArray()

        res.send(result)
    })
    //get a single job dtls

    app.get('/job/:id', async(req, res) =>{
        const id = req.params.id
        const query = {_id: new ObjectId(id) }
        const result = await jobsCollection.findOne(query)
        res.send(result)
    })
// save a  applied job 
    app.post('/appliedJobs', async (req, res) =>{
      const appliedData = req.body;
      
      const result = await applyCollection.insertOne(appliedData);
      res.send(result) 
    })
// add a job job 
    app.post('/postedJobs', async (req, res) =>{
      const jobData = req.body;
      
      const result = await jobsCollection.insertOne(jobData);
      res.send(result) 
    })

  // get my added jobs 
  app.get('/myAddedJobs/:email', async(req, res) =>{
    
    const result = await jobsCollection.find({buyer_email:req.params.email}).toArray()
    res.send(result)
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Assignment 11 is starting ')
})

app.listen(port, () => {
    console.log(`Assignment is coming in port ${port}`);
})
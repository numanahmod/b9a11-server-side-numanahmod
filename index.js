const express = require('express')
const cors = require('cors');
// const jwt = require('jsonwebtoken')
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
   
    // jwt generate 
    // app.post('/jwt', async(req, res)=>{
    //   const user = req.body 
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
    //     expiresIn:'365d',
    //   })
    //   res.send({token})
    // })
   
   
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
      
      const query = {
        email: appliedData.email,
        jobId: appliedData.jobId,
      }

      const alreadyApplied = await applyCollection.findOne(query)
      console.log(alreadyApplied)
      if (alreadyApplied) {
        return res
          .status(400)
          .send('You have already applied on this job.')
          
      } console.log('Applied data ', appliedData);
      const jobQuery = { jobId: appliedData.jobId}
      const result = await applyCollection.insertOne(appliedData);

       // update apply count in jobs collection
       const updateDoc = {
      $set: { $inc: { job_applicants: 1 }},
      }
      
      const updateApplyCount = await applyCollection.updateOne(jobQuery, updateDoc)
      console.log( updateApplyCount)
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
  // delete a job
  app.delete('/deleteAJob/:id', async(req, res) =>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await jobsCollection.deleteOne(query)
    res.send(result)
  })
// update 
app.put('/job/:id', async(req, res) =>{
  const id = req.params.id
  const jobData = req.body
  const query = {_id: new ObjectId(id)}
  const options = {upsert: true}
  const updateDoc = {
    $set: {
      ...jobData,
    },
    
  }
  const result = await jobsCollection.updateOne(query, updateDoc, options)
  res.send(result)
})

// get my applied jobs 
// app.get('/getMyAppliedJobs/:email', async(req, res) =>{
//   const email = req.params.email
  
    
//   const result = await applyCollection.find({email:req.params.email}).toArray()
//   res.send(result)
// })

app.get('/getMyAppliedJobs/:email', async(req, res) =>{
  const email = req.params.email
  const filter = req.query.filter
  let query = {email}
  if (filter) query = {category: filter}
  
    
  const result = await applyCollection.find(query).toArray()
  res.send(result)
})

// filter 

// app.get('/getMyAppliedJobs', async(req, res) =>{
//   const filter = req.query.filter
// let query = {}
// if (filter) query.category = filter

//   const result = await jobsCollection.find(query).toArray()
//   res.send(result)
// })



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
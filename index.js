const express = require ('express');
const cors = require ('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express ();
const port = process.env.PORT || 5000;

//middleware
app.use (cors ());
app.use (express.json ());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rmje4mv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
  
      await client.connect();
      
      const bookCollection = client.db ('libraryDB').collection('allBooks');    
      const addCollection = client.db ('libraryDB').collection('add');       
  
      app.get ('/book', async (req,res) => {
        const cursor = bookCollection.find ();
        const result = await cursor.toArray ();
        res.send (result)
  
      })
  
      app.get('/book/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookCollection.findOne(query)
        res.send(result);
    })



      app.post ('/book', async (req,res) => {
        const newBook = req.body ;       
        const result = await bookCollection.insertOne (newBook);
        res.send (result);
        
    }) 


    app.put('/book/:id' , async (req,res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId (id)}
      const options = { upsert: true };
      const updatedBook = req.body;
      const Product = {
        $set:{
          name: updatedBook.name,
          image: updatedBook.image,
          authorName : updatedBook.authorName,
          category: updatedBook.category,
          quantity: updatedBook.quantity,
          description: updatedBook.description,
          rating: updatedBook.rating

        }
      }
         const result = await bookCollection.updateOne(filter,Product,options)
          res.send(result);
    })









      // add
  
  
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
  
      // await client.close();
    }
  }





run().catch(console.dir);

app.get ('/', (req, res) => {
    res.send ('Assignment 11 Server is Running')
})

app.listen (port, () => {

    console.log(`Assignment 10 Server Side is running on Port: ${port}`);
})
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: 
  [
    // 'http://localhost:5173'
    'https://assignment-11-fbabf.web.app',
    'https://assignment-11-fbabf.firebaseapp.com/'
       

],


  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rmje4mv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middlewares inside function

const logger = async (req, res, next) => {
  console.log('called:', req.host, req.originalUrl)
  next();
}

// verify token
  const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;

  console.log('token Come from verify', token);

  if (!token) {
    return res.status(401).send({ message: 'UnAuthorized' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

    if (err) {
      console.log(err);
      return res.status(401).send({ message: 'Unauthorized' })
    }

    console.log('value in the token', decoded);
    next()
    req.user = decoded;

  })
}




async function run() {
  try {

    await client.connect();

    const bookCollection = client.db('libraryDB').collection('allBooks');
    const addCollection = client.db('libraryDB').collection('add');


    //Jwt Token 
    app.post('/jwt', logger, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,

        })
        .send({ success: true })

    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging Out', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })


    // Book related api

    app.get('/book', async (req, res) => {
      const cursor = bookCollection.find();
      const result = await cursor.toArray();
      res.send(result)

    })

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query)
      res.send(result);
    })


    //token get

    app.get('/book', logger, verifyToken, async (req, res) => {
      console.log(req.query.email);
      console.log('tok tok token', req.user)
      if (req.user.email !== req.query.email) {
        return res.status(403).send ({message: 'forbidden access'})
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookCollection.find(query).toArray();
      res.send(result)

    })





    app.post('/book', async (req, res) => {
      const newBook = req.body;
      const result = await bookCollection.insertOne(newBook);
      res.send(result);

    })


    app.put('/book/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedBook = req.body;
      const Product = {
        $set: {
          name: updatedBook.name,
          image: updatedBook.image,
          authorName: updatedBook.authorName,
          category: updatedBook.category,
          quantity: updatedBook.quantity,
          description: updatedBook.description,
          rating: updatedBook.rating

        }
      }
      const result = await bookCollection.updateOne(filter, Product, options)
      res.send(result);
    })





    // add

    app.post('/borrowItem', async (req, res) => {
      const newPost = req.body;
      const result = await addCollection.insertOne(newPost);
      res.send(result);
    })

    app.get('/borrowItem',  async (req, res) => {
      const cursor = addCollection.find(); 
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/borrowItem/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addCollection.deleteOne(query);
      res.send(result)

    })







    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}





run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Assignment 11 Server is Running')
})

app.listen(port, () => {

  console.log(`Assignment 11 Server Side is running on Port: ${port}`);
})
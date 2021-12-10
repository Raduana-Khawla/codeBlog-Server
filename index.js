const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjlgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect((err) => {
      const postCollection = client.db("codeCollection").collection("post");
      const usersCollection = client.db("codeCollection").collection("user");

      //post review
      app.post("/addPost", async (req, res) => {
        const result = await postCollection.insertOne(req.body);
        res.json(result);
      });
      //get review
      app.get("/addPost", async (req, res) => {
        const result = await postCollection.find({}).toArray();
        res.json(result);
      });
      app.post("/addUserInfo", async (req, res) => {
        console.log("req.body");
        const result = await usersCollection.insertOne(req.body);
        res.json(result);
      });
      //  make admin

      app.put("/makeAdmin", async (req, res) => {
        const filter = { email: req.body.email };
        const result = await usersCollection.find(filter).toArray();
        if (result) {
          const documents = await usersCollection.updateOne(filter, {
            $set: { role: "admin" },
          });
          console.log(documents);
        }
      });

      // check admin or not
      app.get("/checkAdmin/:email", async (req, res) => {
        const result = await usersCollection
          .find({ email: req.params.email })
          .toArray();

        res.json(result);
      });
      //order delete
      app.delete("/deleteOrder/:id", async (req, res) => {
        const result = await ordersCollection.deleteOne({
          _id: ObjectId(req.params.id),
        });
        // console.log(result);
        res.json(result);
      });
      /// all order
      app.get("/allOrders", async (req, res) => {
        // console.log("hello");
        const result = await ordersCollection.find({}).toArray();
        res.json(result);
      });

      // status update
      app.put("/statusUpdate/:id", async (req, res) => {
        const filter = { _id: ObjectId(req.params.id) };
        console.log(req.params.id);
        const result = await ordersCollection.updateOne(filter, {
          $set: {
            status: req.body.status,
          },
        });
        res.json(result);
      });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello code!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
// app.get('/users')
// app.post('/users')
// app.get('/users/:id')
// app.put('/users/:id');
// app.delete('/users/:id')
// users: get
// users: post

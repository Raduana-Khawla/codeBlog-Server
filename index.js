const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

const serviceAccount = require("./code-blog-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjlgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}
async function run() {
  try {
    await client.connect((err) => {
      const postCollection = client.db("codeCollection").collection("post");
      const usersCollection = client.db("codeCollection").collection("user");
      // const commentCollection = client
      //   .db("codeCollection")
      //   .collection("comment");
      const replyCollection = client.db("codeCollection").collection("reply");

      // get all Posts
      app.get("/allPosts", async (req, res) => {
        const result = await postCollection.find({}).toArray();
        // const data = result.filter((item) => item.status === "approve");
        // console.log("object");
        res.json(result);
      });

      // single Post
      app.get("/singleService/:id", async (req, res) => {
        console.log(req.params.id);
        const result = await postCollection
          .find({ _id: ObjectId(req.params.id) })
          .toArray();
        res.json(result[0]);
        // console.log(result);
      });
      //post allposts
      app.post("/addPost", async (req, res) => {
        const result = await postCollection.insertOne(req.body);
        res.json(result);
      });

      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });

      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      });

      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      // post comments
      // app.put("/addcomment/:id", async (req, res) => {
      //   const query = { _id: ObjectId(req.params.id) };
      //   const options = { upsert: true };
      //   const updateDoc = { $push: { comments: { message: "hi" } } };
      //   const result = await movies.updateOne(query, updateDoc, options);
      //   // console.log("hello");
      //   res.send("hello");
      // });

      //reply of comments
      app.post("/addReply", async (req, res) => {
        const result = await replyCollection.insertOne(req.body);
        res.json(result);
      });

      app.put("/users/admin", verifyToken, async (req, res) => {
        const user = req.body;
        const requester = req.decodedEmail;
        if (requester) {
          const requesterAccount = await usersCollection.findOne({
            email: requester,
          });
          if (requesterAccount.role === "admin") {
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
          }
        } else {
          res
            .status(403)
            .json({ message: "you do not have access to make admin" });
        }
      });
      // order delete
      app.delete("/deleteOrder/:id", async (req, res) => {
        const result = await postCollection.deleteOne({
          _id: ObjectId(req.params.id),
        });
        // console.log(result);
        res.json(result);
      });
      /// all order
      app.get("/allOrders", async (req, res) => {
        // console.log("hello");
        const result = await postCollection.find({}).toArray();
        res.json(result);
      });

      // status update
      app.put("/statusUpdate/:id", async (req, res) => {
        const filter = { _id: ObjectId(req.params.id) };
        console.log(req.params.id);
        const result = await postCollection.updateOne(filter, {
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

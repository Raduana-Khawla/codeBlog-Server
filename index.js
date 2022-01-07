const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjlgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// const privateKey = `

// `;
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
      const commentCollection = client
        .db("codeCollection")
        .collection("comment");
      const imageCollection = client.db("codeCollection").collection("image");

      // get all Posts
      app.get("/allPosts", async (req, res) => {
        const result = await postCollection.find({}).toArray();
        res.json(result);
      });

      // single Post
      app.get("/singleService/:id", async (req, res) => {
        console.log(req.params.id);
        const result = await postCollection
          .find({ _id: ObjectId(req.params.id) })
          .toArray();
        res.json(result[0]);
      });
      //post allposts
      app.post("/addPost", async (req, res) => {
        const result = await postCollection.insertOne(req.body);
        res.json(result);
      });

      //post allposts
      app.post("/addcomment", async (req, res) => {
        const result = await commentCollection.insertOne(req.body);
        res.json(result);
      });

      app.get("/comments", async (req, res) => {
        const result = await commentCollection.find({}).toArray();
        res.send(result);
      });
      app.get("/image", async (req, res) => {
        const cursor = imageCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      });

      app.post("/image", async (req, res) => {
        const pic = req.files.image;
        const picData = pic.data;
        const encodedPic = picData.toString("base64");
        const imageBuffer = Buffer.from(encodedPic, "base64");
        const imageStore = {
          image: imageBuffer,
        };
        const result = await imageCollection.insertOne(imageStore);
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
        console.log("put", user);
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

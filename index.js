const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjlgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const privateKey = `
{"kty":"RSA","n":"7cmrtsS7Kj5wyOlEMcI3RYg1PbW-7-CLsO94j_bmg7MRlR1vZQfViDSL5wq-Pqpq2LTDVqZ5ZysOzBKeiPoW9DWQ_2AkpLUw_PQg5QrQlJ4McwdNVb037iGvlkqXaGlGdmNAvl8Xsp_EXiJMj1y_QausgRLJ62FaGIkviiDlfnJA4Rz_thpsUPoZStD1TBGys0YjWPFHDrbcFhDdO48aNPHY4nlxTugfaLWfu1zVmwksiHvzB77gVbiJjiA7UB2K8E2h1-rMen_qAERUDRKl5OtdluOgvJTrO8WjMEVgZWJaI-bZtRu7XiQjQETDdBr1TjEN0-KBxNuTBixbcttYpEc53SHHd7r_WfcNLXemG8l8-GeRe3EC26Eufo2WBYkkONVOAn8ciT0-WyOZ23Mjll1e8863-8c4XpQJnB-CxAZUeV62Y5LKPb4DdQ8vZ0Va6JcFX4JKjG3f5QjjA7IItIddq-yI8UU-ut3QcN9NGRoSugQRV0w6qJ0le-NkQ8oQahDb7Ji4DHtyLsGLQ5c9iAaqykRNOAmhxuyZhwpnniBbdfOu5kHMvkaz8irhDIk2XHe3qvia_N2uO8eGgq1v4Qkzx8C-rEbA5SfmNFbpshrQYEx42iEqDv-Jm2PSvHKKeDCpF-NGgabmfmepGq9iTjHct22IXxRAf4Egxjujamk","e":"AQAB","d":"ClwVMFkJW3mNcd9h0nYm8M9SnH3o0-wZQevo-YK0_8tjKnc2FXV-Ktk5OCdqavIDRi437XRCyUkhs6fjAs48hka4KrweVJO1Tuv26-uo8zSgj7ljd-cOwv_yNa7JwmmFwZ4o4bJkZqqZxE0jv0I37e1EDnqKVAgxg-ykJtUwkm35YCViiaVEj1GaHP2WFkqWGcPmQdd_NEeotohlDxV4u5JG0_UdB-ZKigYRr7jHcKH5b_fQeoepH-ryiT_jvaWP2lDTioPnBTZB9GGFtO0ZT6wmb26638RwLDI73hxDqx8aFMLXvNF4vA0AgSoNxubuxYmTE-ZkJ3a2hNgVYt9mEOqtE9mGlVC_8prFbYz1Kwb5j4mInJ9Sqrc-LxhuYOFRueYL7gqPCvcX2LnIPjpaRd1KuHDfNCp04CE9QDCuAvsqAuUO8C-hQZBBZEPKbTMVzab_16rhEVqZTw_3qtqexKbDFRyUAp-tSPmopFJkMVrN2LigI_ORSIxJ6M1Jqo2pAFl-_bASYsTN6P1_YrDaOd2s1sUmmi88mrsDMrofHNZCTliGcKIoBopKnyod7GhYTWzzwgB0E19rlNPS0glupKcpwb3olFe96pq2oB93UUP8hQEEChRXvzd6zOdnsgisawGwvxXPOX1YchFu0Yk4rH5_HSf92IJRSrtOkhf8Q0E","p":"_RfIKpU1zjlqzg4IZgRy9dxc3FgmPxWJEPI9ve4g5PC1e2o7KU4OL0sa9698EJYzUGN2asSM9BumhpSiTLXW_gQuSrXHiPsdKDS16eCrjR8x4p0cHlblII1hK58bZyvNk8m-vrzNIe7YZGStnLoENPjdwDzprDfw5ARrT_fJIJJxt6Os2kx1w4y1X_xAFhptOMTjobuvgGSHcSyd3espvdgjL3wVYWBlybSRUqSYKCCCvqkTb_E3XEZzh43Tf84HOG5FBgDFaGUZjmJUJUni-WVQj9guynKeIlGM2Cds2GbRI1Id0d7pJC1bAODSjLuwrf02zHkYIkbBygNbMudNIQ","q":"8ITiXbSXeZUEAj0MVUhFOYR0FdLzP3wIzeKbtyijdrZDBLqMxCW3lbYeg-tErihSQZUZrk93A5086uGr-59MGbsMx_D8o-TaM5b6CR1r5jpv6fTyQFBAM4IcGobgZic6VP6FOhHgyXWHKUcBDghmu1i1mhJ3MzAY7g3vz2LmW8wbfsdlauVcScdSeiisShJAZyFIYxngDt-DEyhvNVT8XWO7PBeiiVmFoDJgQ03S7GWwuce-IrxkM_dZe_Z0kCyXU_lGay9jWrFjlUfRkjcWrIWIxhrvCspmBHdBNQbhjpPYWuUVrZYDMvRdtqJbz-Bb6fxE-UjLJ-DyIn_wthTsSQ","dp":"xGO92P0rYTjAnd_ZuH_fTNSP4hMsqmrljxbJviWXtM7rpDaMbcK50wzugh_Tn3NNoiVr7_FQhuMl1uxi_C9mAnnwCd0AVlS1DUvJlQ_XToxUQ0oyVYCMDzRloFm4A9jDjthPgOY0Lw6NL2nIJgNZ3Fj4iYE6uX43GFgthUH6-aFpSFxjdok6IGGBJFgyynP7KL_u-sMOrgxT5QgAAAHIxB2BQAmC9aq9kUTiN0StJQYFLjk4cfa1RI8OerMc2OFgTPOT79KNXDKHICtArCanT2rElrnjpQhHmM27Asek-E7gHg5MQVw9gOsI4KeT-cxyjrAb45Jbnc1V9pGgJOHCwQ","dq":"5gP_Q-QYVKLpAYcGi2yhHz-HkPN7w4PIG7WSe1g286mccCJDyrXTWy6fAkP2G6Pd_nAr7iJ6zA8MmggV5H5UVesnbvMNeWO8NUg2eI8ViEjsjE6_ejgFHf1ZCRlh8u-i_nOmT4GXerKV_yizXos0TAirK9xq-J4PyWG0rJ2Fdda9mMHyQId2eexP-Rl6ox_PTZFr27J8L10byi-KIvPSoTFmdzKXM0lU3H4wx0ze4Uri9tiKAkguf_AWONHaaaLrWdhzur_IAYzRkorrZiye14Cg6-wIHUawx6aQyrh471R-vXaGA8sJ5ioCkU22Bhgnbp7eC5TNDKc4iTvXpRpfWQ","qi":"uV5dtnhF1Na9IbwSFnx6Bip9X0oSVv4JMbUSf7yYZVhf4DTPSjtoZ4nwBCRma0LreLNCjOxu0ypMuX8w2LnJ25mSMzz6kNCvczi3WrgJIG8-KRGuaNpUeAh7xMWlp7AVx6j7rqj2ro1bpL6oBNhkbY-Q1BoDu_X4r2r3EsHMXFGI6qrELxYBpU-CSpZo80X0Yyi3NIYiyjWdBgvyVazcJ9CsdbEgK9wwRe0Emiidgs8ZbzCmuV5r3GnLKMKfzcfz5kBiuuU5H5M50H9ArOpMZ_eN1uB06FOvdI0oA9YDczPgxfkHJZqA8e6BYtYVcSW-iGqczQM0N4c3Zg9m2Pk8sg"}
`;
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

      app.post("/jwt", verifyToken, function (req, res) {
        // NOTE: Before you proceed with the TOKEN, verify your users' session or access.
        const payload = {
          sub: "123", // Unique user id string
          name: "John Doe", // Full name of user

          // Optional custom user root path
          // 'https://claims.tiny.cloud/drive/root': '/johndoe',

          exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes expiration
        };

        try {
          const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
          res.set("content-type", "application/json");
          res.status(200);
          res.send(
            JSON.stringify({
              token: token,
            })
          );
        } catch (e) {
          res.status(500);
          res.send(e.message);
        }
      });
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

      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        // console.log(result);
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
      app.get("/user/:email", async (req, res) => {
        const email = req.params.email;
        const filter = { email };
        const result = await usersCollection.findOne(filter);
        res.json(result);
      });

      app.put("/users/admin", async (req, res) => {
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

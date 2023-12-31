const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqbtto6.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const mealCollection = client.db("hostelDB").collection("meals");
        const userCollection = client.db("hostelDB").collection("users");
        const mealRequestCollection = client.db("hostelDB").collection("mealRequests");
        const reviewCollection = client.db("hostelDB").collection("reviews");
        const upcomingMealCollection = client.db("hostelDB").collection("upcomingMeals");
        const memberCollection = client.db("hostelDB").collection("memberships");
        const paymentCollection = client.db("hostelDB").collection("payments");

        // meals related operation
        app.post('/meals', async (req, res) => {
            const meal = req.body
            const result = await mealCollection.insertOne(meal)
            res.send(result)
        })
        app.get('/meals', async (req, res) => {
            const result = await mealCollection.find().toArray()
            res.send(result)
        })

        app.get('/meals/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await mealCollection.findOne(query)
            res.send(result)
        })

        app.delete('/meals/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await mealCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/meals/:id', async (req, res) => {
            const meal = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    mealTitle: meal.mealTitle,
                    reviews: meal.reviews,
                    mealCategory: meal.mealCategory,
                    price: meal.price,
                    description: meal.description,
                    rating: meal.rating,
                    date: meal.date,
                    likes: meal.likes,
                    ingredients: meal.ingredients,
                    image: meal.image
                }
            }
            const result = await mealCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/adminMeals', async (req, res) => {

            console.log(req.query.email)

            let query = {};
            if (req.query?.email) {
                query = { adminEmail: req.query.email }
            }
            const result = await mealCollection.find(query).toArray()
            res.send(result);
        })


        //   payment related 
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount, 'amount inside the intent')

            // const paymentIntent = await stripe.paymentIntents.create({
            //   amount: amount,
            //   currency: 'usd',
            //   payment_method_types: ['card']
            // });
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });


        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const paymentResult = await paymentCollection.insertOne(payment);


            console.log('payment info', payment);

            res.send(paymentResult)
        })



        //meal request related api
        app.post('/mealRequests', async (req, res) => {
            const mealRequest = req.body
            const result = await mealRequestCollection.insertOne(mealRequest)
            res.send(result)
        })
        app.get('/mealRequests', async (req, res) => {
            const result = await mealRequestCollection.find().toArray()
            res.send(result)
        })
        app.get('/requests', async (req, res) => {

            console.log(req.query.email)

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await mealRequestCollection.find(query).toArray()
            res.send(result);
        })



        //meal reviews related api
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/mealReviews', async (req, res) => {

            console.log(req.query.email)

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await reviewCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })

        app.patch('/reviews/:id', async (req, res) => {
            const review = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    review: review.review,

                }
            }
            const result = await reviewCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })


        //upcoming meal related api

        app.post('/upcomingMeals', async (req, res) => {
            const upcomingMeal = req.body
            const result = await upcomingMealCollection.insertOne(upcomingMeal)
            res.send(result)
        })

        app.get('/upcomingMeals', async (req, res) => {
            const result = await upcomingMealCollection.find().toArray()
            res.send(result)
        })


        //memberships related api

        app.get('/memberships', async (req, res) => {
            const result = await memberCollection.find().toArray()
            res.send(result)
        })



        app.get('/memberships/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await memberCollection.findOne(query)
            res.send(result)
        })


        //   user related api

        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return { massage: 'user already exists', insertedId: null }
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email

            const query = { email: email }
            const user = await userCollection.findOne(query)
            let admin = false
            if (user) {
                admin = user.role === "admin"
            }
            res.send({ admin })
        })






        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('uniHostelHub server is running')
})



app.listen(port, () => {
    console.log(`uniHostelHub server is running on port : ${port}`)
})





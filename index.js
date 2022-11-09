const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const { json } = require('express');
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle ware
app.use(cors());
app.use(json());

// mongodb connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l6guwec.mongodb.net/?retryWrites=true&w=majority`;
// mongo client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const database = client.db('doctor-server');

        const servicesCollection = database.collection('service');
        const bookingCollection = database.collection('bookings');

        app.get('/services', async (req, res) => {
            const service = await servicesCollection.find({}).toArray();
            res.send(service);
        });

        // ei part ta abr kora
        // app.post('/booking', async (req, res) => {
        //     const booking = req.body;
        //     const query = { serviceName: booking.serviceName, patientName: booking.patientName, date: booking.date };
        //     let exists = await bookingCollection.findOne(query);
        //     if (exists) {
        //         return res.send({ success: false, booking: exists });
        //     } else {
        //         const result = await bookingCollection.insertOne(booking);
        //         res.send({ success: true, result })
        //     }
        // })

    }
    catch {

    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Hello doctor server')
});

app.listen(port, () => {
    console.log(`Running on Port ${port}`);
})
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

        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            console.log(bookingData);
            const query = { serviceName: bookingData.serviceName, email: bookingData.email, slot: bookingData.slot, date: bookingData.date };

            const exists = await bookingCollection.findOne(query);
            if (exists) {
                console.log('data not added already exists');
                return res.send({ success: false, data: exists });
            } else {
                const result = await bookingCollection.insertOne(bookingData);
                console.log('data added', result);
                return res.send({ success: true, result });
            }
        });

        app.get('/available', async (req, res) => {
            const date = req.query.date;
            console.log('available get api hitting and date = ',date);
            const services = await servicesCollection.find().toArray();
            const query = { data: date };
            const bookings = await bookingCollection.find(query).toArray();

            // res.send(services);
            services.forEach(service => {
                const serviceBookings = bookings.filter(book => book.serviceName === service.name);
                const bookedSlots = serviceBookings.map(book => book.slot);
                const available = service.slots.filter(slot => !bookedSlots.includes(slot));
                services.slots = available;
            });
            res.send(services);
        });
    }
    catch {

    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Hello doctor server')
});

app.listen(port, () => {
    console.log(`Running on Port: http://localhost:${port}`);
})
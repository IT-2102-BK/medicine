const path = require('path');
const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,
    optionSuccessStatus:200
}


const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
// import com.mongodb.MongoClientSettings
// const MongoClientSettings = require('mongodb').MongoClientSettings
// const MongoCredential = require('mongodb').MongoCredentials


const hostname = '127.0.0.1';
const port = 3000;

// var mongoSettings = MongoClientSettings.FromConnectionString(config.ConnectionString);
// mongoSettings.Credential = MongoCredential.CreateCredential("admin", config.Username, config.Password);
// mongoSettings.useUnifiedTopology = true

MongoClient.connect('mongodb+srv://username:simple_password@medicine-bakzhan.uej5ngj.mongodb.net/?retryWrites=true&w=majority')
    .then(client =>{
        console.log("db connect success");

        const db = client.db('medicine')
        const productsCollection = db.collection('products')

        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(express.static(path.join(__dirname, 'static')))
        app.use(cors(corsOptions));

        // Handlers
        app.get('/', (req, res) => {
            db.collection('products').find().toArray()
            .then(results => {
                res.render('index.ejs', { products: results })
            })
            .catch(error => console.error(error))
        })
        
        app.get('/products', (req, res) => {
            db.collection('products').find().toArray()
            .then(results => {
                res.send(results)
            })
            .catch(error => console.error(error))
        })

        app.get('/register_product', (req, res) => {
            res.sendFile(__dirname + '/register_product.html')
        })
        
        app.post('/register_product', (req, res) => {
            productsCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })
        // End handlers


        app.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    })
    .catch((err)=>{
        throw err
    });


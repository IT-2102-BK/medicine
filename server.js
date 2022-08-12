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
const hostname = '127.0.0.1';
const port = 3000;
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': '####yourclientid######',
  'client_secret': '####yourclientsecret#####'
});

MongoClient.connect('mongodb+srv://Bakzhan:Astana859465@cluster0.xpton.mongodb.net/?retryWrites=true&w=majority')
    .then(client =>{
        console.log("db connect success");

        const db = client.db('medicine')
        const productsCollection = db.collection('products')
        const usersCollection = db.collection('users')

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

        app.get('/regindex', (req, res) => {
            db.collection('users').find().toArray()
            .then(results => {
                res.render('regindex.ejs', { products: results })
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

        app.post('/regindex', (req, res) => {
            usersCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        app.get('/prepopulate_db', (req, res) =>{
            let list = []
            for (let index = 0; index < dataSet.length; index++) {
                const category_list = dataSet[index];
                for (let index2 = 0; index2 < category_list.length; index2++) {
                    let category;
                    const item = category_list[index2];
                    switch (item.category) {
                        case 1:
                            category = "Оптика"
                            break;
                        case 2:
                            category = "Лекарственные средства"
                            break;
                        case 3:
                            category = "Детское питание"
                            break;
                        case 4:
                            category = "Косметика"
                            break;
                        case 5:
                            category = "Другое"
                            break;
                    }
                    name_ = item.name
                    img = item.img
                    price = item.price
                    list.push({name:name_, img:img, price:price, category:category})
                }
            }
            productsCollection.deleteMany( {} )
            productsCollection.insertMany(list)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        app.get('/purchase',  (req, res) =>{
            res.render('purchase.ejs', {data:req.body})
        })

        app.post('/pay', (req, res) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/",
                    "cancel_url": "http://localhost:3000/"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Redhock Bar Soap",
                            "sku": "001",
                            "price": "25.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "25.00"
                    },
                    "description": "Washing Bar soap"
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
              if (error) {
                  throw error;
              } else {
                  for(let i = 0;i < payment.links.length;i++){
                    if(payment.links[i].rel === 'approval_url'){
                      res.redirect(payment.links[i].href);
                    }
                  }
              }
            });

        });
        // End handlers


        app.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    })
    .catch((err)=>{
        throw err
    });

//inner arrays indexes - categories 
// [0] - optika [1] -lek sredstva i td
// класс продукта для удобства добавления в дата сет
class Product {
    constructor(name, price, img, category, item_id) {
        this.name = name; // название продукта
        this.price = price; // цена продукта
        this.img = img; // ссылка на фотографию продукта
        this.category = category; // айди категории
        this.item_id = item_id; // айди продукта в категории
    }
}


//все продукты по категориям
// все имеющиеся продукты
let dataSet = [
    [
        // категория оптика
        new Product('Acuvue Oasys Линзы контактные (6)', '9 240', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/04f/acuvueoasyslinzykontaktnye6.jpg?1601287117274054', 1, 1),
        new Product('RENU Multi Plus Капли увлажняющие, 8 мл.', '1 500', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/fa8/renumultipluskapliuvlazhnyayushchie8ml.jpg?1601290633370777', 1, 2),
        new Product('TOMMY HILFIGER Очки с/з', '46 370', 'https://aptekaplus.kz/local/templates/aptekaplus_template/components/bitrix/catalog.element/.default/images/no_photo.png', 1, 3),
        new Product('Acuvue Oasys Линзы контактные with HydraLuxe', '370', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/a0b/acuvueoasyslinzykontaktnyewithhydraluxe.jpg?1601287118269874', 1, 4),
        new Product('THEA Гель стерильный для век 30г', '3 500', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/897/theagelsterilnyydlyavek30g.jpg?1603367603200425', 1, 5)
    ],
    [
        // категория лекарственные средства
        new Product('ЦЕНТУРИ С-1000 мг', '6 380', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/68e/tsenturis1000mg110tabvitamins.jpg?1604632814126317', 2, 1),
        new Product('ФИЗИО ЛЮТЕИН №30', '5 100', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/ffa/lyutein30kapsul.jpg?160404505066978', 2, 2),
        new Product('ЭЛЮДРИЛ КЛАССИК 90 мл', '2 900', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/8c8/elyudrilklassik90ml.jpg?1601011951271999', 2, 3),
        new Product('ИМУСАН', '4 880', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/b02/imusan30kapsul.jpg?1604045178111435', 2, 4),
        new Product('ФЕНКАРОЛ 50 мг', '2 850', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/328/fenkarol50mg30tab.jpg?1609228127187207', 2, 5),
    ],
    [
        // категория детское питание
        new Product('ФРУТО НЯНЯ Пюре из яблок и абрикосов', '290', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/d13/frutonyanyapyureizyablokiabrikosovsoslivkami90gr.jpg?1602121491254680', 3, 1),
        new Product('ФРУТО НЯНЯ Пюре яблоко/черника', '250', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/a5e/frutonyanyapyureyablokochernika100gr.jpg?1602121482344158', 3, 2),
        new Product('ФРУТО НЯНЯ Пюре яблоко/персик', '360', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/b9d/frutonyanyapyureyablokopersikmzlak130grpauch.jpg?1602121477364820', 3, 3),
        new Product('ФРУТО НЯНЯ Сок яблоко', '370', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/b42/frutonyanyasokyablokoosvetlennyybezsakhara500ml.jpg?1602121508333459', 3, 4),
        new Product('ФРУТО НЯНЯ Сок яблоко с шиповником', '200', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/fac/frutonyanyasokyablokosshipovnikom200ml.jpg?1602121487320869', 3, 5),
    ],
    [
        // категория косметика
        new Product('MILANI Хайлайтер', '6 020', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/253/milanikhaylaytersgalagraficheskimeffektomlusterlight03.jpg?1612414724372493', 4, 1),
        new Product('MILANI Палитра теней', '9 110', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/6ad/milanipalitrateneypurepassion04.jpg?1612414763466946', 4, 2),
        new Product('MILANI BAKED BLUSH Румяна', '3 810', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/15d/milanibakedblushrumyanazapechennyerosedoro02.jpg?1612414778383949', 4, 3),
        new Product('AVENE EAU THERMALE Сыворотка', '9 900', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/14e/aveneeauthermalesyvorotkaclenancewomennochnoy30ml223309.jpg?1611907222167201', 4, 4),
        new Product('MILANI Палитра теней', '10 060', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/317/milanipalitrateneygildedrougeb9352a.jpg?1612414625586774', 4, 5),
    ],
    [
        //
        new Product('Пластырь для тела', '640', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/9a4/yukanplastyrdlyatelashaolin2sht.jpg?1602057969361987', 5, 1),
        new Product('ХАЛАТ МЕДИЦИНСКИЙ', '7 800', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/58f/ekofarmkhalatmeditsinskiyzhenskiy.jpg?1601353176181236', 5, 2),
        new Product('Аптечка', '4 800', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/68f/sofiyaaptechkamateriirebenka.jpg?1602124545352031', 5, 3),
        new Product('СКОРАЯ ПОМОЩЬ Присыпка', '1 500', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/212/skorayapomoshchprisypkadlyazazhivleniyaran15gr.jpg?1602124835186012', 5, 4),
        new Product('ПИНЦЕТ Анатомический', '2 100', 'https://opt-1144656.ssl.1c-bitrix-cdn.ru/upload/iblock/da7/pintsetanatomicheskiyobshchegonaznacheniyapa20025.jpg?1601291218126342', 5, 5),
    ]
]

// end dataset
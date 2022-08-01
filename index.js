const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
var nodemailer = require("nodemailer");
var twilio = require("twilio")(process.env.TWILIO1, process.env.TWILIO2);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect(process.env.MONGO_DB_ATLAS_URL);

const purchaseSchema = new mongoose.Schema({
    buyerEthAddress: String,
    productId: Number,
    firstname: String,
    email: String,
    txHash: String,
    contractAddress: String,
    soldQty: Number,
    dateOfPurchase: String
});

const Purchase = mongoose.model("purchase", purchaseSchema);

const contractSchema = new mongoose.Schema({
    productId: Number,
    name: String,
    contractAddress: String,
    soldQty: Number
});

const Contract = mongoose.model("contract", contractSchema);

product_data_arr = [
    {
        "id": 1,
        "name": "Sony Headphones",
        "description": "Hands-free, Hands-on Music Experience. Best Class Premium Sony Product.",
        "price": 18000,
        "currency": "Rs",
        "image": "../images/sony.png",
        "warranty": 3,
        "contract_address": "0xAb9680A518798B8310cA8fd2FF6C9E2e932DBa3f",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmYay8oK6PgZm8Z82iz65WHqsUaUBqXrXfxkduWF8tnJKn"
    },
    {
        "id": 2,
        "name": "Nothing Phone 1",
        "description": "Budget Flagship by Nothing.",
        "price": 30000,
        "currency": "Rs",
        "image": "../images/nothing.webp",
        "warranty": 1,
        "contract_address": "0xAe2aD1528044fb8A9936F4861aE81Ff2B64E2372",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmbAeRm2LwkUXdbBbnmCaHsqyPHDUNhCfW8gRJNxcpRrCo"
    },
    {
        "id": 3,
        "name": "Apple MacBook M1 Pro",
        "description": "The Apple M1 chip gives the 13-inch MacBook Pro speed and power beyond belief.",
        "price": 225000,
        "currency": "Rs",
        "image": "../images/appleMacbook.png",
        "warranty": 3,
        "contract_address": "0x7ff6681438C5195281ab0f51BE78b42ee46e3521",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmPwbfXeVXo17sohDwF9UrDRh5PzUkQrN3hiTnPyWiLcDQ"
    },
    {
        "id": 4,
        "name": "Boat Rockerz Nirvana",
        "description": "Hands-full, Hands-off Music Experience by Boat.",
        "price": 1500,
        "currency": "Rs",
        "image": "../images/boatRockerzNirvana.png",
        "warranty": 2,
        "contract_address": "0x4127879343A45e70CA2c258889877813234D8e39",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmXdvTU4Y9xDs1HjJh8MLjCvEzjPUivgt6sQQ43YJKb9Mc"
    },
    {
        "id": 5,
        "name": "Amazfit GTR 2",
        "description": "HD Color AMOLED Display, Heart Rating Monitoring, Blood-oxygen Measurement.",
        "price": 10000,
        "currency": "Rs",
        "image": "../images/amazfit.png",
        "warranty": 3,
        "contract_address": "0x9a337E75AA699B3cd696900c4f2A3EbEFd1903A7",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmcdMtBNtSF9f2xT93qFAHiUShdJ8NXy4xPUpoLGPng7DD"
    },
    {
        "id": 6,
        "name": "Google Pixel 6A",
        "description": "Google Tensor makes Pixel 6A super smart and powerful.",
        "price": 39000,
        "currency": "Rs",
        "image": "../images/pixel6a.png",
        "warranty": 2,
        "contract_address": "0xE5cC527738EB55dbC066F190328b2924EC262bf8",
        "metadata_contract_link": "https://gateway.pinata.cloud/ipfs/QmZFpMY5Wz4tG9mKaSx3wvTYM5g68kJAYeKxURZRsD9WwA"
    }
]

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/checkout", (req, res) => {
    res.sendFile(__dirname + "/checkout.html");
});

app.get("/beforeSuccess/:prodId/:firstname/:email/:txHash/:currentUserEthAddress/:contractAddress/:phone", (req, res) => {
    let prodId = req.params['prodId'];
    console.log("productId: " + prodId);
    let firstname = req.params['firstname'];
    console.log(firstname);
    let email = req.params['email'];
    console.log(email);
    let txHash = req.params['txHash'];
    console.log(txHash);
    let currentUserEthAddress = req.params['currentUserEthAddress'];
    console.log(currentUserEthAddress);
    let contractAddress = req.params['contractAddress'];
    console.log(contractAddress);
    let phone = req.params['phone'];
    console.log(phone);
    // res.send("done ji");
    // return;

    Contract.findOne({ productId: prodId }, (err, obj) => {
        if (err) {
            console.log(err);
            res.send("Some error!!!");
        }
        else {
            console.log("Fetched the old sold Qty: " + obj.soldQty);
            let newQty = obj.soldQty + 1;
            Contract.updateOne({ productId: prodId }, { soldQty: newQty }, function (err) {
                if (err) { console.log(err); res.send("Some error2!!!"); }
                else {
                    console.log("Incremented sold Qty Mongo!!!");
                    console.log("New Sold Qty: " + newQty);

                    // add purchase details to mongo purchases:
                    let date = new Date().toLocaleDateString();
                    let purchase = new Purchase({
                        buyerEthAddress: currentUserEthAddress,
                        productId: prodId,
                        firstname: firstname,
                        email: email,
                        txHash: txHash,
                        contractAddress: contractAddress,
                        soldQty: newQty,
                        dateOfPurchase: date
                    });
                    purchase.save();
                    // mongoose.connection.close();

                    // sending mail:
                    let verifyLink = "https://testnets.opensea.io/assets/rinkeby/" + contractAddress + "/" + newQty;
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.NODEMAILER_USER,
                            pass: process.env.NODEMAILER_PASS
                        }
                    });

                    var mailOptions = {
                        from: process.env.NODEMAILER_USER,
                        to: email,
                        subject: 'Order Confirmed: AgniShop - Product No. ' + prodId,
                        html: `<h2>Hello, ${firstname}</h2><br />
                        You order has been confirmed and will be shipped soon!<br /><br />
                        TxHash: ${txHash}<br /><br />
                        Click here to see your Digital Product NFT: <a href=${verifyLink}>Verify</a><br /><br />Greetings, AgniShop`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    let phoneToTwilio = "+91" + phone;
                    twilio.messages.create({
                        from: process.env.TWILIO_PHONE_NO,
                        to: phoneToTwilio,
                        body: `Hello, ${firstname}. You order has been confirmed and will be shipped soon! Click here to see your Digital Product NFT: ${verifyLink} Greetings, AgniShop.`
                    }).then((res) => console.log("SMS sent!!!" + res))
                        .catch((err) => console.log(err));

                    res.redirect("/success/" + newQty);
                }
            });
        }
    });
});

app.get("/success/:newSoldQty", (req, res) => {
    let newSoldQty = req.params['newSoldQty'];
    console.log("newSoldQty: " + newSoldQty);

    res.render("success", { newSoldQty: newSoldQty });
    // res.sendFile(__dirname + "/success.html");
});

app.get("/about", (req, res) => {
    res.render("about", {});
    // res.sendFile(__dirname + "/success.html");
});

app.get("/purchaseHistory/:currentUserEthAddress", (req, res) => {
    let currentUserEthAddress = req.params['currentUserEthAddress'];
    console.log("currentUserEthAddress: " + currentUserEthAddress);

    // query purchase details for current user from mongo purchases:
    // let Purchase = mongoose.model("Purchase", purchaseSchema);

    Purchase.find({ buyerEthAddress: currentUserEthAddress }, (err, purchases) => {
        if (err) {
            console.log(err);
            res.send("Some error while fetching!!!");
        }
        else {
            // console.log(purchases);
            // mongoose.connection.close();
            res.render("purchaseHistory", { purchasesArr: purchases, productsData: product_data_arr, currentUserEthAddress: currentUserEthAddress });
        }
    });
});


app.listen(process.env.PORT, process.env.HOST, () => {
    console.log("Server started on port 3000");
});
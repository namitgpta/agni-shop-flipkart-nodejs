// Moralis.initialize("f0HoOEses66K1Ot1M5MygNPWICS59ZgfeBsY8gBB");
// Moralis.serverURL = "https://y4ov6n7hcxuc.usemoralis.com:2053/server";
/* Moralis init code */
const serverUrl = "https://y4ov6n7hcxuc.usemoralis.com:2053/server";
const appId = "f0HoOEses66K1Ot1M5MygNPWICS59ZgfeBsY8gBB";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

const web3 = new Web3(window.ethereum);

const amountElement = document.getElementById("amount");
var productPrice = null;
var firstname = "", lastname = "", email = "", address = "", phone = null;
let currentUserEthAddress = null, globalJsonData = null, productId = null;
var payPalJsonStringUrlPass = null;
var accounts;

async function init() {
    if (productId == null) return;
    console.log(accounts[0]);

    firstname = document.querySelector("#firstName").value;
    lastname = document.querySelector("#lastName").value;
    email = document.querySelector("#email").value;
    phone = document.querySelector("#phone").value;
    address = document.querySelector("#address").value;

    txHash = await mintToken(globalJsonData[productId - 1].metadata_contract_link);
    console.log("Transaction hash: " + txHash);
    // if (txHash != null) {
    //     sessionStorage.setItem("productQty", globalJsonData[productId - 1].soldQty + 1);
    // }

    // comment this:(for testing purpose)
    if (payPalJsonStringUrlPass == null)
        payPalJsonStringUrlPass = { "id": "dummyPayPalData" };

    console.log("Paypal returned data: " + payPalJsonStringUrlPass);

    //session storage:
    sessionStorage.setItem("productId", productId);
    sessionStorage.setItem("firstName", firstname);
    sessionStorage.setItem("lastName", lastname);
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("phone", phone);
    sessionStorage.setItem("address", address);
    sessionStorage.setItem("payPalTxId", payPalJsonStringUrlPass.id);
    sessionStorage.setItem("ethTransactionHash", txHash);
    sessionStorage.setItem("buyerEthAddress", currentUserEthAddress);

    // window.location.href = "/success";
    window.location.href = "/beforeSuccess/" + productId + "/" + firstname + "/" + email + "/" + txHash + "/" + currentUserEthAddress + "/" + globalJsonData[productId - 1].contract_address + "/" + phone;

    // window.location.href = "http://127.0.0.1:5500/success.html?productId=" + productId + "&firstName=" + firstname + "&lastName=" + lastname + "&email=" + email + "&address=" + address + "&payPalTxId=" + payPalJsonStringUrlPass.id + "&ethTransactionHash=" + txHash + "&buyerEthAddress=" + currentUserEthAddress;
}

async function mintToken(_uri) {
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
        name: "safeMint",
        type: "function",
        inputs: [{
            type: 'string',
            name: 'uri'
        }]
    }, [_uri]);

    const transactionParameters = {
        to: globalJsonData[productId - 1].contract_address,
        from: ethereum.selectedAddress,
        data: encodedFunction
    };
    const txt = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
    });
    console.log("Minted Success !!!");
    return txt;
}

async function initialize() {
    // const urlParams = new URLSearchParams(window.location.search);
    // productId = urlParams.get("productId");
    productId = sessionStorage.getItem("productId");

    // await fetch("./product_data.json")
    //     .then(response => {
    //         return response.json();
    //     })
    //     .then(jsondata => {
    //         globalJsonData = jsondata;
    //     });
    globalJsonData = product_data_arr;

    console.log("product id: " + productId);
    console.log(globalJsonData);

    $("#div_img").html(`<div>
    <div class="card_img">
        <img src="${globalJsonData[productId - 1].image}" width="200"/>
    </div>
    <div class="card_header">
        <h2 class="my-3">${globalJsonData[productId - 1].name}</h2>
        <p>${globalJsonData[productId - 1].description}</p>
        <p class="price">Amount to Pay: <span>${globalJsonData[productId - 1].currency}&nbsp<span>${globalJsonData[productId - 1].price}</p>
    </div>
</div>`);

    productPrice = globalJsonData[productId - 1].price;
    console.log(productPrice);
    amountElement.value = productPrice;

    if (!user) {
        user = await Moralis.authenticate({
            signingMessage: "Log in using Moralis",
        })
            .then(function (user) {
                console.log("logged in user:", user);
                currentUserEthAddress = user.get("ethAddress");
                console.log(user.get("ethAddress"));
            })
            .catch(function (error) {
                console.log(error);
            });
    } else {
        currentUserEthAddress = user.get("ethAddress");
        console.log(user.get("ethAddress"));
    }

    // const web3 = await Moralis.enableWeb3();
    // const web3 = await new Web3(window.ethereum);
    const options = { address: globalJsonData[productId - 1].contract_address, chain: "rinkeby" };
    NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
    console.log(globalJsonData[productId - 1].name + " Issued NFTs: ");
    console.log(NFTs);

    // accounts = await web3.eth.getAccounts();
    accounts = await ethereum.request({ method: 'eth_accounts' });
}

initialize();

paypal.Buttons({
    // Sets up the transaction when a payment button is clicked    
    createOrder: (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: productPrice / 80 // Can also reference a variable or function
                }
            }]
        });
    },
    // Finalize the transaction after payer approval
    onApprove: (data, actions) => {
        return actions.order.capture().then(function (orderData) {
            // Successful capture! For dev/demo purposes:
            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
            const transaction = orderData.purchase_units[0].payments.captures[0];
            // alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);

            payPalJsonStringUrlPass = orderData;

            // minting starts here:
            init();
        });
    }
}).render('#paypal-button-container');

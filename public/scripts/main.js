/* Moralis init code */
const serverUrl = "https://y4ov6n7hcxuc.usemoralis.com:2053/server";
const appId = "f0HoOEses66K1Ot1M5MygNPWICS59ZgfeBsY8gBB";
Moralis.start({ serverUrl, appId });

let user = Moralis.User.current();
const options = { address: "0xAe2aD1528044fb8A9936F4861aE81Ff2B64E2372", chain: "rinkeby" };

let currentUserEthAddress = null, globalJsonData = null, NFTs = null;

function purchaseHistoryClick() {
    if (currentUserEthAddress != null) {
        console.log(currentUserEthAddress);
        window.location.href = "/purchaseHistory/" + currentUserEthAddress;
    } else {
        alert("Please sign in with metamask first!!!");
    }
}

function aboutClick() {
    window.location.href = "/about";
}

function buyNowHandler(id) {
    sessionStorage.setItem("productId", id);
    // window.location.href = "http://127.0.0.1:5500/checkout.html?productId=" + id;
    window.location.href = "/checkout";

    // console.log(globalJsonData[id - 1]);
}

function getListItems() {
    globalJsonData = product_data_arr;
    const listItems = globalJsonData.map((item) =>
        `<div class="card">
            <div class="card_img">
                <img src="${item.image}"/>
            </div>
            <div class="card_header">
                <h2>${item.name}</h2>
                <p>${item.description}</p>
                <p class="price">${item.price}<span>${item.currency}<span></p>
                <div class="btn" onclick="buyNowHandler(${item.id})">Buy Now</div>
            </div>
        </div>`
    );
    $(".main_content").html(listItems);
    // globalJsonData = jsonData;
}

function fetchProducts() {
    fetch("./product_data.json")
        .then(response => {
            return response.json();
        })
        .then(jsondata => {
            console.log(jsondata); getListItems(jsondata);
        });
}

async function initializeApp() {
    // sessionStorage.setItem("productQty", -1);

    if (!user) {
        user = await Moralis.authenticate({
            signingMessage: "Log in using Moralis",
        })
            .then(function (user) {
                console.log("logged in user:", user);
                currentUserEthAddress = user.get("ethAddress");
                console.log(user.get("ethAddress"));
                $("#login_button").html("🦊" + user.get("ethAddress").substring(0, 13) + "...");
            })
            .catch(function (error) {
                console.log(error);
            });
    } else {
        currentUserEthAddress = user.get("ethAddress");
        console.log(user.get("ethAddress"));
        $("#login_button").html("🦊" + user.get("ethAddress").substring(0, 13) + "...");
    }

    NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
    console.log(NFTs);

    // await fetchProducts();

    getListItems();


}

if (user) {
    initializeApp();
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    $("#login_button").html("🦊Login with MetaMask");
    currentUserEthAddress = null;

    window.location.reload();
}
document.getElementById("login_button").onclick = initializeApp;
document.getElementById("logout_button").onclick = logOut;




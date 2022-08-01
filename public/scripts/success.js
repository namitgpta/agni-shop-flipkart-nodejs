let currentUserEthAddress = null, globalJsonData = null, productId = null, productContractAddress = null, newSoldQty = null;
const date = new Date().toLocaleDateString();

async function initialize() {

    // const urlParams = new URLSearchParams(window.location.search);
    // productId = urlParams.get("productId");
    // firstname = urlParams.get("firstName");
    // lastname = urlParams.get("lastName");
    // email = urlParams.get("email");
    // address = urlParams.get("address");
    // payPalTxId = urlParams.get("payPalTxId");
    // ethTransactionHash = urlParams.get("ethTransactionHash");

    productId = sessionStorage.getItem("productId");
    firstname = sessionStorage.getItem("firstName");
    lastname = sessionStorage.getItem("lastName");
    email = sessionStorage.getItem("email");
    phone = sessionStorage.getItem("phone");
    address = sessionStorage.getItem("address");
    payPalTxId = sessionStorage.getItem("payPalTxId");
    ethTransactionHash = sessionStorage.getItem("ethTransactionHash");
    currentUserEthAddress = sessionStorage.getItem("buyerEthAddress");

    console.log(payPalTxId);
    console.log(ethTransactionHash);
    console.log(address);
    // payPalData = JSON.parse(urlParams.get("payPalData"));
    // console.log("PayPal returned data: " + payPalData);
    $("#firstName1").html("Hello, " + firstname);
    $("#orderDate1").html(date);
    $("#orderDate2").html(date);
    $("#address1").html(address);
    $("#orderNo1").html(payPalTxId);
    $("#ethTxHash1").html(ethTransactionHash.substring(0, 14) + "...");
    $("#ethTxHash1").attr('href', "https://rinkeby.etherscan.io/tx/" + ethTransactionHash);
    $("#openSeaLink1").html(currentUserEthAddress.substring(0, 14) + "...");
    $("#openSeaLink1").attr('href', "https://testnets.opensea.io/" + currentUserEthAddress);

    $("#email1").html('We will be sending shipping confirmation email to "' + email + '" with an SMS to ' + phone + ' when the item is shipped successfully!');

    // await fetch("./product_data.json")
    //     .then(response => {
    //         return response.json();
    //     })
    //     .then(jsondata => {
    //         globalJsonData = jsondata;
    //     });

    globalJsonData = product_data_arr;

    productPrice = globalJsonData[productId - 1].price;
    productContractAddress = globalJsonData[productId - 1].contract_address;

    $("#productImg1").attr('src', "../" + globalJsonData[productId - 1].image);
    $("#productName1").html(globalJsonData[productId - 1].name);
    $("#productPrice1").html("Rs. " + globalJsonData[productId - 1].price);
    $("#warrantyPeriod1").html(globalJsonData[productId - 1].warranty + " Year");

    newSoldQty = parseInt($("#productSerialNo1").html());
    console.log("taken: " + newSoldQty);

    $("#ownershipProofLink1").html("Verify");
    $("#ownershipProofLink1").attr('href', "https://testnets.opensea.io/assets/rinkeby/" + productContractAddress + "/" + newSoldQty);

}

initialize();

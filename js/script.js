let globalData, coinList, coinID, $newCrypto

const apiRoot ="https://api.coingecko.com/api/v3/"
// API Methods
const global = 'global' //get cc global data
const getList = 'coins/list' //list of all supported cc, cache for later queries

const $ttlCurrencies = $('#ttlCurrencies');
const $ttlMarketCap = $('#ttlMarketCap');

// clear local storage
$('#clearText').on('click',function() {
    //your javacript
    console.log("Clear local storage")
});

// submit button
$('#submitBtn').on('click', function(evt) {
    $newCrypto = $('#cryptoInput').prop('value');
    if($newCrypto.length > 3) {
        $newCrypto = $newCrypto.charAt(0).toUpperCase() + $newCrypto.slice(1);
    } else {
        newCrypto = $newCrypto.toUpperCase()
    }
    console.log($newCrypto);
    $('#cryptoInput').prop('value','');
    coinLookUp($newCrypto);
});



// getting global market data
$.ajax({
    url:apiRoot + global
}).then(
    (data) => {
        globalData = data;
        // console.log(globalData);
        let tempTCC = numberWithCommas(globalData.data.active_cryptocurrencies)
        let tempTMC = numberWithCommas(globalData.data.total_market_cap.usd.toFixed(0))
        $ttlCurrencies.text(`${tempTCC}`);
        $ttlMarketCap.text(`$${tempTMC}`);
    }
);

// cache coin data for lookup 
$.ajax({
    url:apiRoot + getList
}).then(
    (data) => {
        coinList = data;
        // array of coin objects, symbols are lower case, names are capitalized
        // console.log(coinList[0]);
        // console.log(coinList.find((coin) => coin.symbol=="eth"));
});


// code snipet to format market cap
function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// code snipet to prevent page refresh on enter in submit form
// need to fix this so enter acts the same as button click
// $(function() {
//     $("form").submit(function() { return false; });
// });

// new coin lookup
function coinLookUp(token) {
    if (coinList.find((coin) => coin.symbol==token)){
        console.log(`Found Symbol - ${token}`);
        // console.log(coinList.find((coin) => coin.symbol==token).id)
        coinID = coinList.find((coin) => coin.symbol==token).id
        console.log(coinID);
    } else if (coinList.find((coin) => coin.name==token)) {
        console.log(`Name Found - ${token}`);
        // console.log(coinList.find((coin) => coin.name==token).id)
        coinID = coinList.find((coin) => coin.name==token).id
        console.log(coinID);
    } else {
        alert(`No Matching Coin Found`)
    };
}
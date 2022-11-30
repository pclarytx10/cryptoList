let globalData, coinList, $newCrypto

const apiRoot ="https://api.coingecko.com/api/v3/"
// API Methods
const global = 'global' //get cc global data
const getList = 'coins/list' //list of all supported cc, cache for later queries

const $ttlCurrencies = $('#ttlCurrencies');
const $ttlMarketCap = $('#ttlMarketCap');

$('#clearText').on('click',function() {
    //your javacript
    console.log("Clear local storage")
});

$('#submitBtn').on('click', function(evt) {
    $newCrypto = $('#cryptoInput').prop('value');
    console.log($newCrypto);
    $('#cryptoInput').prop('value','');
});

// code snipet to format market cap
const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

$.ajax({
    url:apiRoot + global
}).then(
    (data) => {
        globalData = data;
        console.log(globalData);
        let tempTCC = numberWithCommas(globalData.data.active_cryptocurrencies)
        let tempTMC = numberWithCommas(globalData.data.total_market_cap.usd.toFixed(0))
        $ttlCurrencies.text(`${tempTCC}`);
        $ttlMarketCap.text(`$${tempTMC}`);
    }
);



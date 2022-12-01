let globalData, coinList, coinID, coinData, coinRow, $newCrypto

// varibles needed for table
let coinName, coinSymbol, coinUSD, coinMCap, coinATHPercent, coinATH, coinATHDate, coinMarkets
let btnRow = '<td><button type="button" class="btn btn-danger btn-sm">X</button></td>'

const apiRoot ="https://api.coingecko.com/api/v3/"
// API Methods
const global = 'global' //get cc global data
const getList = 'coins/list' //list of all supported cc, cache for later queries
const getCoin = 'coins/' //pull coin info add coin id to string as input

const $ttlCurrencies = $('#ttlCurrencies');
const $ttlMarketCap = $('#ttlMarketCap');
const $marketCapChange = $(`#mcChange`);

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
    // console.log($newCrypto);
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
        let tempTCC = numberWithCommas(globalData.data.active_cryptocurrencies);
        let tempTMC = numberWithCommas(globalData.data.total_market_cap.usd.toFixed(0));
        let tempMCC = numberWithCommas(globalData.data.market_cap_change_percentage_24h_usd.toFixed(1))
        $ttlCurrencies.text(`${tempTCC}`);
        $ttlMarketCap.text(`$${tempTMC}`);
        $marketCapChange.text(`${tempMCC}%`);
        if(tempMCC < 0) {
            $marketCapChange.css('color', 'red')
        } else {
            $marketCapChange.css('color', 'green')
        }
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
        // console.log(`Found Symbol - ${token}`);
        // console.log(coinList.find((coin) => coin.symbol==token).id)
        coinID = coinList.find((coin) => coin.symbol==token).id
        // console.log(coinID);
        getCoinData(coinID)
    } else if (coinList.find((coin) => coin.name==token)) {
        // console.log(`Name Found - ${token}`);
        // console.log(coinList.find((coin) => coin.name==token).id)
        coinID = coinList.find((coin) => coin.name==token).id
        // console.log(coinID);
        getCoinData(coinID)
    } else {
        alert(`No Matching Coin Found`)
    };
}

// pull coin information 
function getCoinData(tokenID) {
    $.ajax({
        url:apiRoot + getCoin + tokenID
    }).then(
        (data) => {
            coinData = data;
            // console.log(coinData);
            createTableRow(coinData)
    });
}

function createTableRow(coinObj) {
    // console.log(coinObj);
    coinName = `<td>` + coinObj.name + `</td>` 
    // console.log(coinName);
    coinSymbol = `<td>` + coinObj.symbol.toUpperCase() + `</td>` 
    coinUSD = `<td>$` + coinObj.market_data.current_price.usd.toFixed(4) + `</td>`
    coinMCap = `<td>` + coinObj.market_data.market_cap_change_percentage_24h.toFixed(2) + `%</td>` 
    coinATHPercent = `<td>` + coinObj.market_data.ath_change_percentage.usd.toFixed(2) + `%</td>` 
    coinATH = `<td>$` + coinObj.market_data.ath.usd.toFixed(4) + `</td>` 
    coinATHDate = `<td>` + coinObj.market_data.ath_date.usd + `</td>` 
    coinMarkets = `<td>Test Value</td>` 
    let tableRow = `<tr>
                    ${coinName}
                    ${coinSymbol}
                    ${coinUSD}
                    ${coinMCap}
                    ${coinATHPercent}
                    ${coinATH}
                    ${coinATHDate}
                    ${coinMarkets}
                    ${btnRow}
                    </tr>`
    console.log(tableRow);
    $("#coinsTable").append(tableRow)
}

// add an event listener for "#coinsTable" remove button
$("#coinsTable").on("click", function (evt) {
    // console.log("Gonna Delete Somethnig....")
    const tgt = evt.target
    const tgtTR = $(tgt).parentsUntil("tbody")
    console.log($(tgtTR[1]))
    $(tgtTR).remove()
})


let globalData, globalMC, coinList, coinID, coinData, coinMarketData, coinRow, $newCrypto

const apiRoot ="https://api.coingecko.com/api/v3/"
// API Methods
const global = 'global' //get cc global data
const getList = 'coins/list' //list of all supported cc, cache for later queries
const getCoin = 'coins/' //pull coin info add coin id to string as input

const $ttlCurrencies = $('#ttlCurrencies');
const $ttlMarketCap = $('#ttlMarketCap');
const $marketCapChange = $(`#mcChange`);

// getting global market data
$.ajax({
    url:apiRoot + global
}).then(
    (data) => {
        globalData = data;
        // console.log(globalData);
        let tempTCC = numberWithCommas(globalData.data.active_cryptocurrencies);
        globalMC = globalData.data.total_market_cap.usd.toFixed(0);
        let tempTMC = numberWithCommas(globalMC);
        let tempMCC = globalData.data.market_cap_change_percentage_24h_usd.toFixed(1);
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

// varibles needed for table
let coinName, coinSymbol, coinUSD, coinChange, coinMCap, coinATHPercent, coinATH, coinATHDate, coinMarkets
let btnRow = '<td class="dangerBtn"><button type="button" class="btn btn-danger btn-sm">X</button></td>'

// clear local storage
$('#clearText').on('click',function() {
    //your javacript
    console.log("Clear local storage")
});

// submit button
$('#submitBtn').on('click', function(evt) {
    $newCrypto = $('#cryptoInput').prop('value');
    if($newCrypto.length > 5) {
        $newCrypto = $newCrypto.charAt(0).toUpperCase() + $newCrypto.slice(1);
    } else {
        $newCrypto = $newCrypto.toLowerCase()
        console.log($newCrypto);
    }
    $('#cryptoInput').prop('value','');
    coinLookUp($newCrypto);
    // console.log($newCrypto);
});

// accept input on enter keypress in input form
$("form").on('keydown', function(evt) {
    const tgt = evt.keyCode
    // console.log(tgt);
    if (tgt === 13) {
        // console.log("Enter was pressed");
        $newCrypto = $('#cryptoInput').prop('value');
        if($newCrypto.length > 5) {
            $newCrypto = $newCrypto.charAt(0).toUpperCase() + $newCrypto.slice(1);
        } else {
            $newCrypto = $newCrypto.toLowerCase()
        }
        $('#cryptoInput').prop('value','');
        coinLookUp($newCrypto);
        // console.log($newCrypto);
    } else {}
    
  });

// create btc row
getCoinData('bitcoin')

// $('.btn-danger').remove()

// code snipet to format market cap
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// new coin lookup
function coinLookUp(token) {
    if(coinList.filter((coin) => coin.symbol==token).length > 1 || token === 'sand') {
        alert('The token you have entered returns more than one cryptocurrency. Please enter the name of the token instead.')
    } else if (coinList.find((coin) => coin.symbol==token)){
        coinID = coinList.find((coin) => coin.symbol==token).id
        getCoinData(coinID)
    } else if (coinList.find((coin) => coin.name==token)) {
        coinID = coinList.find((coin) => coin.name==token).id
        getCoinData(coinID)
    } else {
        alert(`No matching coin found. If your coin name contains multiple words, try capitalizing the second word or formatting it as it appears on CoinGecko's website. Example: "Binance USD" If you have entered a coin ticker that was not found, please try using the full name of the coin. Example: Polygon instead of MATIC`)
    };
}

// pull coin information 
function getCoinData(tokenID) {
    $.ajax({
        url:apiRoot + getCoin + tokenID
    }).then(
        (data) => {
            coinData = data;
            createTableRow(coinData)
    });
}

// table creation and styling
function formatCurrency(currency) {
    if (currency < 0.01) {
        return currency.toFixed(4)
    } else if ( currency < 1000) {
        return currency.toFixed(2)
    } else {
        return numberWithCommas(currency.toFixed(2))
        // return currency.toFixed(2)
    }
}

function testRowStyling() {
    rowArray = $('.athPer')
    $.each(rowArray, function(index, value){
        rowVal = rowArray[index].innerText
        rovVal = rowVal.slice(0, -1); 
        if (rowVal > 0) {
            rowArray.attr('style','color:green;')
        } else {
            rowArray.attr('style','color:red;')
        };
    });
    
}
//test on load, also test when new row is created in createTableRow
testRowStyling()

const usApprovedExchanges = [
    'Coinbase Exchange',
    'Crypto.com Exchange',
    "Kraken",
    "Uniswap (v2)",
    "Blockchain.com",
    "Gemini",
    "Binance US",
]
//  coinMarketData
function getMarketData(objIn) {
    coinMarketData = objIn
    marketsArray = []
    selectMarkets = []
    const unique = (value, index, self) => {
        return self.indexOf(value) === index
      }
    $.each(coinMarketData, function(index, value){
        marketsArray.push(coinMarketData[index].market.name)
        marketsArray = marketsArray.filter(unique)
        // console.log(marketsArray);
    });
    
    if (marketsArray.includes('Coinbase Exchange')) {
        selectMarkets.push('Coinbase')
    };
    if (marketsArray.includes('Crypto.com Exchange')) {
        selectMarkets.push('Crypto.com')
    };
    if (marketsArray.includes('Uniswap (v2)')) {
        selectMarkets.push('Uniswap')
    };
}

function createTableRow(coinObj) {
    getMarketData(coinObj.tickers);
    coinName = `<td>` + coinObj.name + `</td>`;
    coinSymbol = `<td>` + coinObj.symbol.toUpperCase() + `</td>`; 
    coinUSD = `<td>$` + formatCurrency(coinObj.market_data.current_price.usd) + `</td>`;
    // console.log(coinObj.market_data.price_change_percentage_24h);
    coinChange = `<td class="athPer">` + coinObj.market_data.price_change_percentage_24h.toFixed(1) + `%</td>`
    let marketCap = coinObj.market_data.market_cap.usd / globalMC * 100
    coinMCap = `<td>` + marketCap.toFixed(1) + `%</td>`; 
    coinATHPercent = `<td class="athPer">` + coinObj.market_data.ath_change_percentage.usd.toFixed(1) + `%</td>`;
    coinATH = `<td>$` + formatCurrency(coinObj.market_data.ath.usd) + `</td>`;
    const newDate = new Date(coinObj.market_data.ath_date.usd).toLocaleDateString('en-US', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
    });
    coinATHDate = `<td>` + newDate + `</td>`; 
    coinMarkets = `<td>${selectMarkets.join(', ')}</td>`; 
    let tableRow = `<tr>
                    ${coinName}
                    ${coinSymbol}
                    ${coinUSD}
                    ${coinChange}
                    ${coinMCap}
                    ${coinATH}
                    ${coinATHPercent}
                    ${coinATHDate}
                    ${coinMarkets}
                    ${btnRow}
                    </tr>`
    // console.log(tableRow);
    $("#coinsTable").append(tableRow)
    testRowStyling()
    if (coinObj.name === 'Bitcoin') {
        $('.dangerBtn').remove();
    }
}

// add an event listener for "#coinsTable" remove button
$("#coinsTable").on("click", function (evt) {
    // console.log("Gonna Delete Somethnig....")
    const tgt = evt.target
    if($(tgt).hasClass('btn-danger')) {
        // console.log($(tgtTR[1]))
        const tgtTR = $(tgt).parentsUntil("tbody")
        $(tgtTR).remove()
    } else {}

})

const exampleList = [
    "Ethereum or ETH",
    "Cardano or ADA",
    "Monero or XMR",
    "Polgon or MATIC",
    "Dogecoin or DOGE",
    "Tether or TUSD",
]

// write examples from array
$.each(exampleList, function(index, value){
    $("#exaList").append(`<li>${value}</li>`)
});

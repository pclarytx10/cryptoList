// IIFE - keeps variables from leaking to global scope
$(function() {
    let globalData, globalMC, coinList, coinID, coinData, coinMarketData, coinRow, $newCrypto, storedDate 
    let userTokens = []
    let cryptoTable = []

    const apiRoot ="https://api.coingecko.com/api/v3/"
    // API Methods
    const global = 'global' //get cc global data
    const getList = 'coins/list' //list of all supported cc, cache for later queries
    const getCoin = 'coins/' //pull coin info add coin id to string as input

    // localStorage functions
    // localStorage.setItem("cryptoList", JSON.stringify(coinList));
    // localStorage.setItem("storedTokens", JSON.stringify(userTokens));

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

    // check localStorage for cached coin data
    storedDate = new Date(localStorage.getItem("listDate"))

    if (checkElapsedTime() > 24){
        callListAPI()
    } else if (localStorage.getItem("cryptoList") !== null && localStorage.getItem("cryptoList").length > 0) {
        coinList = JSON.parse(localStorage.getItem("cryptoList"));
        storedDate = new Date(localStorage.getItem("listDate"))
        // console.log('list exists, cache from local');
    } else {
        callListAPI()
    }

    // cache coin data to memory for lookup 
    function callListAPI() {
            $.ajax({
                url:apiRoot + getList
            }).then(
                (data) => {
                    coinList = data;
                    // push new list and timestamp to localStorage
                    localStorage.setItem("cryptoList", JSON.stringify(coinList));
                    localStorage.setItem("listDate",Date())
                    storedDate = new Date(localStorage.getItem("listDate"))
                    console.log('list cached from API');
            });
    }

    // test for time elapsed, change return to switch between min and hours
    function checkElapsedTime() {
        const startTime = storedDate.getTime();
        const endTime = Date.now();
        let result = ''
        // minutes = (endTime - startTime) / 60000
        hours = (endTime - startTime) / 3600000
        return hours;
    }

    // varibles needed for table
    let coinName, coinSymbol, coinUSD, coinChange, coinMCap, coinATHPercent, coinATH, coinATHDate, coinMarkets, coinImage
    let btnRow = '<td class="dangerBtn"><button type="button" class="btn btn-danger btn-sm">X</button></td>'

    // clear local storage and dump all user entered data
    $('#clearText').on('click',function() {
        alert("Clear local storage")
        localStorage.clear();
        userTokens = [];
        cryptoTable = [];
        location.reload();
    });

    // submit button
    $('#submitBtn').on('click', function(evt) {
        $newCrypto = $('#cryptoInput').prop('value');
        if($newCrypto.length > 5) {
            $newCrypto = $newCrypto.charAt(0).toUpperCase() + $newCrypto.slice(1);
        } else {
            $newCrypto = $newCrypto.toLowerCase()
        }
        $('#cryptoInput').prop('value','');
        coinLookUp($newCrypto);
    });

    // accept input on enter keypress in input form
    $("form").on('keydown', function(evt) {
        const tgt = evt.keyCode
        if (tgt === 13) {
            $newCrypto = $('#cryptoInput').prop('value');
            if($newCrypto.length > 5) {
                $newCrypto = $newCrypto.charAt(0).toUpperCase() + $newCrypto.slice(1);
            } else {
                $newCrypto = $newCrypto.toLowerCase()
            }
            $('#cryptoInput').prop('value','');
            coinLookUp($newCrypto);
        } else {}
    });

    // create btc row and render table on first load
    if (cryptoTable.length === 0) {
        getCoinData('bitcoin');
        renderTable();
        testRowStyling();
    }

    // load userTokens from localStorage
    if (localStorage.getItem("storedTokens") !== null && localStorage.getItem("storedTokens").length > 0) {
        userTokens = JSON.parse(localStorage.getItem("storedTokens"));
        // console.log(JSON.parse(localStorage.getItem("storedTokens")));
        $.each(userTokens, function(idx, value){
            getCoinData(value);
        });
    } else {
        localStorage.setItem("storedTokens","");
    }

    // code snipet to format market cap
    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    // new coin lookup
    function coinLookUp(token) {
        // console.log("looking up: " + token.toLowerCase());
        if (userTokens.includes(token.toLowerCase())) {
            alert("Token exists. Please enter another cryptocurrency.");
        } else {
            if(coinList.filter((coin) => coin.symbol==token).length > 1 || token === 'sand') {
                alert('The token you have entered returns more than one cryptocurrency. Please enter the name of the token instead.')
            } else if (coinList.find((coin) => coin.symbol==token)){
                coinID = coinList.find((coin) => coin.symbol==token).id
                getCoinData(coinID);
                tokenStore(coinID);
            } else if (coinList.find((coin) => coin.name==token)) {
                coinID = coinList.find((coin) => coin.name==token).id
                getCoinData(coinID);
                tokenStore(coinID);
            } else {
                alert(`No matching coin found. If your coin name contains multiple words, try capitalizing the second word or formatting it as it appears on CoinGecko's website. Example: "Binance USD" If you have entered a coin ticker that was not found, please try using the full name of the coin. Example: Polygon instead of MATIC`)
            };
        };
    }

    // existing coin lookup and delete
    function localLookUp(token) {
        coinID = coinList.find((coin) => coin.name==token).id;
        // console.log(`${token}, ${coinID}`);
        tokenDrop(coinID);
    }

    // sync localStorage and userTokens
    function tokenStore(token) {
        userTokens.push(token);
        localStorage.setItem("storedTokens", JSON.stringify(userTokens));
    }

    function tokenDrop(token) {
        // console.log(`Dropping ${token}`);
        for( var i = 0; i < userTokens.length; i++){   
            if ( userTokens[i] === token) { 
                userTokens.splice(i, 1); 
            }
        };
        for( var i = 0; i < cryptoTable.length; i++){   
            if ( cryptoTable[i].coinID === token) { 
                cryptoTable.splice(i, 1); 
            }
        };
        localStorage.setItem("storedTokens", JSON.stringify(userTokens));
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
    };

    function createTableRow(coinObj) {
        getMarketData(coinObj.tickers);
        coinImage = `<img src="${coinObj.image.small}" width="20px" alt="${coinObj.name}" style="margin-right: 3px"></img>`
        coinName = `<td class="ccName">` + coinImage + coinObj.name + `</td>`;
        coinSymbol = `<td>` + coinObj.symbol.toUpperCase() + `</td>`; 
        coinUSD = `<td>$` + formatCurrency(coinObj.market_data.current_price.usd) + `</td>`;
        // console.log(coinObj.market_data.price_change_percentage_24h);
        coinChange = `<td class="athPer">` + coinObj.market_data.price_change_percentage_24h.toFixed(1) + `%</td>`
        let marketCap = coinObj.market_data.market_cap.usd / globalMC * 100
        coinMCap = `<td class="perMarketCap">` + marketCap.toFixed(1) + `%</td>`; 
        coinATHPercent = `<td class="athPer">` + coinObj.market_data.ath_change_percentage.usd.toFixed(1) + `%</td>`;
        coinATH = `<td>$` + formatCurrency(coinObj.market_data.ath.usd) + `</td>`;
        const newDate = new Date(coinObj.market_data.ath_date.usd).toLocaleDateString('en-US', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
        });
        coinATHDate = `<td>` + newDate + `</td>`; 
        coinMarkets = `<td>${selectMarkets.join(', ')}</td>`; 
        let tableRow = ""
        if (coinObj.name === 'Bitcoin') {
            // $('.dangerBtn').remove();
            tableRow = `<tr class= "coinRow">  ${coinName} ${coinSymbol} ${coinUSD} ${coinChange} ${coinMCap} ${coinATH} ${coinATHPercent} ${coinATHDate} ${coinMarkets} </tr>`
        } else {
            tableRow = `<tr class="tableRow"> ${coinName} ${coinSymbol} ${coinUSD} ${coinChange} ${coinMCap} ${coinATH} ${coinATHPercent} ${coinATHDate} ${coinMarkets} ${btnRow} </tr>`
        };
        let row = {
            html: tableRow,
            coinID: coinObj.id,
            sort: coinObj.market_data.market_cap.usd.toFixed(1),
        }
        cryptoTable.push(row);
        renderTable();
    };

    function renderTable() {
        $(".coinRow, .tableRow").remove();
        cryptoTable.sort((a,b) => b.sort - a.sort); 
        cryptoTable.forEach(tableElement => {
            // console.log(tableElement.sort);
            $("#coinsTable").append(tableElement.html);
        });
        testRowStyling();
    };

    // add an event listener for "#coinsTable" remove button
    $("#coinsTable").on("click", ".btn-danger", function (evt) {
        // console.log("Gonna Delete Somethnig....")
        const tgt = evt.target;
        const tgtCoin = $(tgt).parentsUntil("tbody").find(".ccName").prop("innerText");
        localLookUp(tgtCoin);
        const tgtTR = $(tgt).parentsUntil("tbody");
        $(tgtTR).remove();

    });

    const exampleList = [
        "Ethereum or ETH",
        "Cardano or ADA",
        "Monero or XMR",
        "Polgon or MATIC",
        "Dogecoin or DOGE",
        "Tether or USDT",
    ]

    // write examples from array
    $.each(exampleList, function(index, value){
        $("#exaList").append(`<li>${value}</li>`)
    });
})

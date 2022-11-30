// console.log("My app.js file is attached")
const apiRoot ="https://pro-api.coingecko.com/api/v3/"

$('#clearText').on('click',function() {
    //your javacript
    console.log("Clear local storage")
});

$('#submitBtn').on('click', function(evt) {
    const $newCrypto = $('#cryptoInput').prop('value');
    console.log($newCrypto);
    $('#cryptoInput').prop('value','');
});
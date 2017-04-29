#!/usr/bin/env /usr/local/bin/node

const bitbar = require("bitbar");
const KrakenClient = require("kraken-api")
const PoloniexClient = require("poloniex-api-node");
const config = require("./config");

const FONT = 'Monaco';
//color
const COLOR_GREY = '#848484';
const COLOR_RED = '#ff3d38';
const COLOR_GREEN = '#31B404';
const COLOR_BLUE = '#0000FF';
const COLOR_WHITE = '#FFFFFF';
const SMALL_SIZE = 12;

let arrayBitBar = [{
    text: "🤑",
    dropdown: false
}]

arrayBitBar.push(bitbar.sep);

let kraken;
let poloniex;

let promises = []

if (config.platforms.hasOwnProperty("kraken")) {
    kraken = new KrakenClient(config.platforms.kraken.key, config.platforms.kraken.secret);

    /*Show the current currency you're holding, and how much BTC there worth
    in the current format:
    ISONAME amount valueInBTC
    */
    promises.push(new Promise((resolve, reject) => {
        var arrayKraken = [];

        kraken.api("Balance", null, (err, result) => {
            if (err) { reject(err) }
            else {
                result = result.result;
                arrayKraken.push({
                    text: 'Kraken',
                    color: COLOR_RED,
                    font: FONT
                });

                let balances = [];
                for (var key in result) {
                    //Filter only the one with something on it
                    if (parseFloat(result[key]) > 0 && key !== "XXBT") {
                        balances.push({
                            name: key, // ISO code for the currency
                            value: result[key] // how much you have of this currency
                        });
                    }
                }
                //Get pair with BTC for each currency in balance
                var pairs = {}
                balances.forEach(b => {
                    pairs[b.name] = b.name + "XXBT";
                });
                // Query Tickers for each pairs
                kraken.api("Ticker", { pair: Object.keys(pairs).map(k => pairs[k]).join(",") }, (err, tickers) => {
                    if (err) { reject(err) }
                    else {
                        tickers = tickers.result;
                        balances.forEach(b => {
                            let average = tickers[pairs[b.name]].p[0] // volume weighted average price today
                            let averageLast24 = tickers[pairs[b.name]].p[1] // volume weighted average price for last 24H
                            let btcValue = parseFloat(average) * parseFloat(b.value); //How much BTC you have for this currency

                            // let percentageUpdate = ((average - averageLast24)/averageLast24)*100; // % change
                            // percentageUpdate = percentageUpdate.toFixed(2); // trunc float to 2 number after dot

                            arrayKraken.push({
                                text: `${b.name} ${b.value} = ${btcValue}₿`,
                                color: COLOR_WHITE,
                                font: FONT,
                                size: SMALL_SIZE
                            });

                            resolve(arrayKraken);
                        });
                    }
                })
            }
        })
    }));
}

if (config.platforms.hasOwnProperty("poloniex")) {
    poloniex = new PoloniexClient(config.platforms.poloniex.key, config.platforms.poloniex.secret);

    promises.push(new Promise((resolve, reject) => {
        var arrayPolo = [];
        //Get your current balances
        poloniex.returnCompleteBalances(null, (err, result) => {
            if (err) { reject(err) }
            else {
                arrayPolo.push(bitbar.sep);
                arrayPolo.push({
                    text: 'Poloniex',
                    color: COLOR_GREEN,
                    font: FONT
                });
                
                let balances = []
                for (var key in result) {
                    if (result[key].available > 0.0) {
                        balances.push({
                            name: key,
                            value: result[key].available,
                            btc: result[key].btcValue
                        });
                    }
                }
                
                balances.forEach(b => {
                    arrayPolo.push({
                        text: `${b.name} ${b.value} = ${b.btc}₿`,
                        color: COLOR_WHITE,
                        font: FONT,
                        size: SMALL_SIZE
                    });
                });
                resolve(arrayPolo);
            }
        });
    }));
}

Promise.all(promises)
    .then(arrays => {
        arrays.insert(0, arrayBitBar);
        var merged = [].concat.apply([], arrays);
        bitbar(merged);
    })
    .catch(e => console.log(e));

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
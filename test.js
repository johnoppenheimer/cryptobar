const KrakenClient = require("kraken-api")

const config = require("./config");

const kraken = new KrakenClient(config.platforms.kraken.key, config.platforms.kraken.secret);

kraken.api("TradeBalance", null, (err, data) => {
    console.log(err || data.result);
})
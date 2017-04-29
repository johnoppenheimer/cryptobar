const Poloniex = require("poloniex-api-node");

function PoloniexClient(key, secret) {
    let poloniex = new Poloniex('your_key', 'your_secret');


}

module.exports = PoloniexClient;
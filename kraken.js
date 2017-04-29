const KClient = require("kraken-api");

/**
 * 
 * @param {String} key API Key
 * @param {String} secret API Secret
 * @param {*} [otp] Two factor password (optional) (also, doesn't work)
 */
function KrakenClient(key, secret, otp) {
    var self = this;
    var kraken = new KClient(key, secret, otp);
    /**
     * This method makes a public or private API request
     * @param {String} method 
     * @param {Object} params
     * @return {Promise<Object>} return a Promise with the respose
     */
    function api(method, params) {
        return new Promise((resolve, reject) => {
            kraken.api(method, params, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.result);
                }
            });
        });
    }

    self.api = api;
}

module.exports = KrakenClient;
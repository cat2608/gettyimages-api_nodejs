var os = require("os");
var request = require("request");
var pjson = require("../package.json");

module.exports = WebHelper;

function WebHelper(credentials, requestOptions) {

    this.get = function (path, next) {

        var options = {
            proxy: requestOptions.proxy,
            url: "https://" + requestOptions.hostName + path,
            method: "GET",
            headers: {
                "Api-Key": credentials.apiKey,
                "Accept": "application/json"
            }
        };

        if (credentials.apiKey && credentials.apiSecret) {
            credentials.getAccessToken(function (err, response) {
                if (err) {
                    next(err, null);
                } else {
                    if (response.access_token) {
                        options.headers.Authorization = "Bearer " + response.access_token;
                    }
                    var req = execRequest(options, next);
                    req.end();
                }
            });
        } else {
            execRequest(options, next);
        }
    };

    this.postForm = function (postData, path, next) {

        var options = {
            proxy: requestOptions.proxy,
            url: "https://" + requestOptions.hostName + path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": postData.length
            },
            form: postData
        };

        execRequest(options, next);
    };

    this.postQuery = function (path, next) {

        credentials.getAccessToken(function (err, response) {
            if (err) {
                next(err, null);
            } else {
                var options = {
                    proxy: requestOptions.proxy,
                    url: "https://" + requestOptions.hostName + path,
                    method: "POST",
                    headers: {
                        "Api-Key": credentials.apiKey,
                        "Authorization": "Bearer " + response.access_token,
                        "Content-Length": 0
                    },
                    form: ""
                };
                execRequest(options, next);
            }
        });
    };

    function execRequest(options, next) {

        addUserAgentString(options);

        return request(options, function (error, httpResponse, body) {
            if (httpResponse.statusCode === 200) {
                next(null, JSON.parse(body));
            } else {
                var err = new Error(httpResponse.statusMessage);
                err.statusCode = httpResponse.statusCode;
                next(err, null);
            }
        });
    }

    function addUserAgentString(options) {
        options.headers["User-Agent"] = "GettyImagesApiSdk/" + pjson.version + " (" + os.type() + " " + os.release() + "; " + "Node.js " + process.version + ")";
    }
}

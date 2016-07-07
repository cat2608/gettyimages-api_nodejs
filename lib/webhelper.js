var os = require("os");
var request = require("request");
var pjson = require("../package.json");

module.exports = WebHelper;

function WebHelper(credentials, hostName, proxy) {

    this.get = function (path, next) {

        var options = {
            proxy: proxy,
            url: "https://" + hostName + path,
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
                    var req = beginRequest(options, next);
                    req.end();
                }
            });
        } else {
            var req = beginRequest(options, next);
            req.end();
        }
    };

    this.postForm = function (postData, path, next) {

        var options = {
            proxy: proxy,
            url: "https://" + hostName + path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": postData.length
            }
        };

        var req = beginRequest(options, next);
        req.write(postData);
        req.end();
    };

    this.postQuery = function (path, next) {

        credentials.getAccessToken(function (err, response) {
            if (err) {
                next(err, null);
            } else {
                var options = {
                    proxy: proxy,
                    url: "https://" + hostName + path,
                    method: "POST",
                    headers: {
                        "Api-Key": credentials.apiKey,
                        "Authorization": "Bearer " + response.access_token,
                        "Content-Length": 0
                    }
                };

                var req = beginRequest(options, next);
                req.end();
            }
        });
    };

    function beginRequest(options, next) {

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

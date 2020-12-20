const http = require('http');
const url = require('url');
const auth = require('./auth');
const jsondb = require('lo-jsondb');

const createServer = (requestHandler) => {
    return http.createServer(requestHandler);
}

const urlToDbName = (url) => {

}

const setHeaders = (res, statusCode) => {
    res.setHeader("Content-type", 'application/json');
    res.statusCode = statusCode;
}

const appendDebug = (res, req, data) => {
    const debug = [
        data,
        Date.now(),
        req.url,
        JSON.stringify(queryParamsToObject(url.parse(req.url).query))
    ];
    res.end(`${debug.join("\r\n\r\n")}`);
}

const queryParamsToObject = (queryParams) => {
    const queryObj = {};
    if(queryParams === null || queryParams === undefined) return queryObj;

    const allQueries = queryParams.split('&');
    allQueries.forEach(query => {
        const keyVal = query.split('=');
        queryObj[keyVal[0]] = keyVal[1];
    });
    return queryObj;
}

const handleGet = (req, res, url, body) => {
    if(body.find) {
        const db = jsondb(url.pathName);
        const records = db.find(body.find);
        if(records.length > 0) {
            res.statusCode = 200;
        } else {
            res.statusCode = 404;
        }
        return res.end(JSON.stringify(records));
    } else {
        res.statusCode = 400;
        return res.end("GET request must have find property")
    }
};
const handlePut = (req, res, url, body) => {
    if(body.data && body.find) {
        const db = jsondb(url.pathName);
        db.update(body.find, body.data);
        res.statusCode = 200;
        return res.end();
    } else {
        res.statusCode = 400;
        return res.end("PUT request must have find and data properties")
    }
};
const handlePost = (req, res, url, body) => {
    const db = jsondb(url.pathName);
    const preexisting = db.find(body);
    if(preexisting.length > 0) {
        res.statusCode = 409;
        return res.end(`Conflict with existing record(s): ${JSON.stringify(preexisting)}`);
    } else {
        db.create(body);
        res.statusCode = 200;
        res.end();
    }
};
const handleDelete = (req, res, url, body) => {
    if(body.find) {
        const db = jsondb(url.pathName);
        const matching = db.find(body.find);
        db.delete(body.find);
        res.statusCode = 200;
        res.end(JSON.stringify(matching));
    } else {
        res.statusCode = 400;
        return res.end("DELETE request must have find property")
    }
};

const handleRequest = (req, res) => {
    const parsedUrl = url.parse(req.url);
    const queryParams = queryParamsToObject(parsedUrl.query);
    
    if(!auth.validateKey(queryParams.key)) {
        res.statusCode = 403;
        res.end('Unauthorised');
        return;
    }
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            body = JSON.parse(body);
        } catch (error) {
            res.statusCode = 400;
            return res.end("Valid JSON body required for all methods to this server\r\n" + body);
        }
        switch (req.method) {
            case 'GET':
                handleGet(req, res, parsedUrl, body);
                break;
            case 'POST':
                handlePost(req, res, parsedUrl, body);
                break;
            case 'PUT':
                handlePut(req, res, parsedUrl, body);
                break;
            case 'DELETE':
                handleDelete(req, res, parsedUrl, body);
                break;
            default:
                res.statusCode = 501;
                res.end(`METHOD NOT IMPLEMENTED; ${req.method}`);
                break;
        }
        res.statusCode = 500;
        appendDebug(res, req, 'Server mishandled request');
    });  

}

createServer(handleRequest).listen(80);
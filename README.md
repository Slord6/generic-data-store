# generic-data-store
Web interface to JSON-backed databases

A simple web interface to CRUD actions against [lo-jsondb](https://github.com/renatorib/lo-jsondb)

## Use

To access a database for any query use the url format: `example.com/databaseName?key=somekey`.

Valid keys are any key in the `keys` array in `auth.js`. The examples below forego the `key` parameter for simplicity, but it is always required.

## Methods

### GET

(Strictly speaking this server doesn't correctly comply with HTTP spec (see [SO answer](https://stackoverflow.com/questions/978061/http-get-with-request-body)) because the body of a GET has semantic meaning, but we want richer find options without potentially running into URL length limits and having to encode JSON into the url, so what the hell.)

To get a record(s), send a JSON body with the `find` property set to any valid [lo-jsondb find](https://github.com/renatorib/lo-jsondb#find) value (function search excluded), eg:

`GET localhost/pokemon`
```JSON
{
    "find": {
        "types": "grass"
    }
}
```

### SEARCH

The SEARCH verb can be used as a replacement for the GET verb for libraries that are tetchy about GET requests with a body.

### POST

To create a new record, POST the new data to the database endpoint. If the data conflicts with existing records you'll get a `409` back with a body of the conflicting records, otherwise a `200` with the created record in the body.

### PUT

To update a record, PUT the (optionally partial) updated record data to the database endpoint as the `data` property on the JSON body. The body must also have a `find` property which identifies the record(s) in that database to update as per the [lo-jsondb update](https://github.com/renatorib/lo-jsondb#update). Eg:

`PUT localhost/pokemon`
```JSON
{
    "find": {"types": ["electric"]},
    "data": {"friendsWith": "Pikachu"}
}

Returns `200` status with modified records in the body when successful, and a `404` when no matching records were found.
```

### DELETE

To delete a record(s), send a JSON body with the `find` property set to any valid [lo-jsondb delete](https://github.com/renatorib/lo-jsondb#delete) value, eg:

`DELETE localhost/pokemon`
```JSON
{
    "find": {
        "types": "grass"
    }
}
```

The deleted records are returned in the response body.

Be careful, you can easily mass-delete records with an overly-broad `find` value.
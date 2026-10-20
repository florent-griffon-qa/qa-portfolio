# BUG-002 - CreateBooking returns 500 when a required field is missing

| Field       | Value                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Open (characterized by an automated test)                                                                                                                                                       |
| Severity    | Major                                                                                                                                                                                           |
| Component   | Restful-Booker API, `POST /booking`                                                                                                                                                             |
| Measured on | 2026-10-20, public instance (https://restful-booker.herokuapp.com) and local Docker image `mwinteringham/restfulbooker@sha256:e4a04233731ceca2e6d99bca16689e0d4bc44631047ab351b6f11b5fa08fb418` |
| Covered by  | `postman/collections/restful-booker.postman_collection.json`, request(s) N04                                                                                                                    |

## Steps to reproduce

1. `POST /booking` with headers `Content-Type: application/json` and `Accept: application/json`.
2. Body: a valid booking without the `firstname` field.

## Expected

`400 Bad Request` with a message naming the missing field. The API doc marks `firstname` as required.

## Actual

`500 Internal Server Error`, plain-text body `Internal Server Error`. Input validation is missing: a client error is reported as a server failure.

## Evidence

Same result on both instances:

```text
POST /booking  (valid body without "firstname")
-> 500 Internal Server Error
Internal Server Error
```

## Test policy

The test asserts the current behaviour and is named `KNOWN BUG BUG-002`. When the API is fixed, the test
fails with `BUG-002 may be fixed`: update the test to the expected behaviour, then close this report.
See "Known defects policy" in `postman/README.md`.

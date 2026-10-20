# BUG-004 - DELETE or PUT on a deleted booking returns 405 instead of 404

| Field       | Value                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Open (characterized by an automated test)                                                                                                                                                       |
| Severity    | Minor                                                                                                                                                                                           |
| Component   | Restful-Booker API, `DELETE and PUT /booking/{id}`                                                                                                                                              |
| Measured on | 2026-10-20, public instance (https://restful-booker.herokuapp.com) and local Docker image `mwinteringham/restfulbooker@sha256:e4a04233731ceca2e6d99bca16689e0d4bc44631047ab351b6f11b5fa08fb418` |
| Covered by  | `postman/collections/restful-booker.postman_collection.json`, request(s) N11, N12                                                                                                               |

## Steps to reproduce

1. Create a booking, get a token, delete the booking.
2. Send `DELETE /booking/{id}` again, then `PUT /booking/{id}` with a valid body, both with the token.

## Expected

`404 Not Found`, as `GET /booking/{id}` already returns for the same deleted id.

## Actual

`405 Method Not Allowed`, plain-text body `Method Not Allowed`. 405 tells the client the method is not supported on this URI, which is false: the same request worked before the delete. The API doc lists no error response.

## Evidence

Same result on both instances:

```text
DELETE /booking/{id}  (already deleted, valid token)  -> 405 Method Not Allowed
PUT    /booking/{id}  (already deleted, valid token)  -> 405 Method Not Allowed
GET    /booking/{id}  (already deleted)               -> 404 Not Found
```

## Test policy

The test asserts the current behaviour and is named `KNOWN BUG BUG-004`. When the API is fixed, the test
fails with `BUG-004 may be fixed`: update the test to the expected behaviour, then close this report.
See "Known defects policy" in `postman/README.md`.

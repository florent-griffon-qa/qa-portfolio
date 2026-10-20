# BUG-001 - CreateToken returns 200 on bad credentials

| Field       | Value                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Open (characterized by an automated test)                                                                                                                                                       |
| Severity    | Major                                                                                                                                                                                           |
| Component   | Restful-Booker API, `POST /auth`                                                                                                                                                                |
| Measured on | 2026-10-20, public instance (https://restful-booker.herokuapp.com) and local Docker image `mwinteringham/restfulbooker@sha256:e4a04233731ceca2e6d99bca16689e0d4bc44631047ab351b6f11b5fa08fb418` |
| Covered by  | `postman/collections/restful-booker.postman_collection.json`, request(s) N03                                                                                                                    |

## Steps to reproduce

1. `POST /auth` with header `Content-Type: application/json`.
2. Body: a valid username and a wrong password.

## Expected

`401 Unauthorized` (RFC 9110, section 15.5.2), with no token in the body.

## Actual

`200 OK` with body `{"reason":"Bad credentials"}`. A client that checks only the status code treats a failed login as a success. The API doc lists no error response for CreateToken.

## Evidence

Same result on both instances:

```text
POST /auth  {"username":"admin","password":"<wrong>"}
-> 200 OK
{"reason":"Bad credentials"}
```

## Test policy

The test asserts the current behaviour and is named `KNOWN BUG BUG-001`. When the API is fixed, the test
fails with `BUG-001 may be fixed`: update the test to the expected behaviour, then close this report.
See "Known defects policy" in `postman/README.md`.

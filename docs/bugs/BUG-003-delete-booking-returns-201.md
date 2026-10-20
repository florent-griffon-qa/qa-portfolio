# BUG-003 - DeleteBooking returns 201 Created

| Field       | Value                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Open (characterized by an automated test)                                                                                                                                                       |
| Severity    | Minor                                                                                                                                                                                           |
| Component   | Restful-Booker API, `DELETE /booking/{id}`                                                                                                                                                      |
| Measured on | 2026-10-20, public instance (https://restful-booker.herokuapp.com) and local Docker image `mwinteringham/restfulbooker@sha256:e4a04233731ceca2e6d99bca16689e0d4bc44631047ab351b6f11b5fa08fb418` |
| Covered by  | `postman/collections/restful-booker.postman_collection.json`, request(s) P08, N10                                                                                                               |

## Steps to reproduce

1. Create a booking with `POST /booking` and get a token with `POST /auth`.
2. `DELETE /booking/{id}` with header `Cookie: token=<token>`.

## Expected

`204 No Content` (or `200 OK` with a body), RFC 9110, section 9.3.5. `201 Created` means a resource was created.

## Actual

`201 Created`, plain-text body `Created`. The API doc also announces 201, so the doc matches the behaviour: the defect is in the design of the response.

## Evidence

Same result on both instances:

```text
DELETE /booking/{id}  (Cookie: token=<valid token>)
-> 201 Created
Created
```

## Test policy

The test asserts the current behaviour and is named `KNOWN BUG BUG-003`. When the API is fixed, the test
fails with `BUG-003 may be fixed`: update the test to the expected behaviour, then close this report.
See "Known defects policy" in `postman/README.md`.

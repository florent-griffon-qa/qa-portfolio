# Restful-Booker - API documentation vs measured behaviour

Every row below comes from a real call, made on 2026-10-20 against both the public instance
(https://restful-booker.herokuapp.com) and the local Docker image pinned in
`docker/docker-compose.yml`. Both instances returned the same results.

Source of the documentation: https://restful-booker.herokuapp.com/apidoc/index.html

## Classification rule

- Defect: the behaviour contradicts the documentation, OR violates HTTP semantics (RFC 9110) on a
  state-changing operation in a way that can mislead a client. It gets a bug report in
  `docs/bugs/` and a `KNOWN BUG` test.
- Design observation: the behaviour is documented and has no impact on data state. It is
  recorded here, not filed as a bug.
- Documentation gap: the doc is silent or inaccurate; the behaviour itself is not necessarily wrong.

Applied to the two borderline cases:

- BUG-003, DeleteBooking returns 201: defect. The 201 is documented, but DELETE changes data state
  and 201 tells a client that a resource was created when one was removed.
- O-001, HealthCheck returns 201: design observation. The 201 is documented and `GET /ping`
  changes no data, so the wrong status cannot mislead a client about data state.

## Method

1. Read the documented request, parameters and responses for each endpoint.
2. Call the endpoint with valid and invalid input, record the status code and the body.
3. Classify each difference with the rule above.

## Summary

| Endpoint (doc title)                       | Case                      | Documented     | Measured          | Classification                                                             |
| ------------------------------------------ | ------------------------- | -------------- | ----------------- | -------------------------------------------------------------------------- |
| HealthCheck `GET /ping`                    | nominal                   | 201 Created    | 201 Created       | Design observation O-001                                                   |
| CreateToken `POST /auth`                   | valid credentials         | 200 OK         | 200 OK            | Matches                                                                    |
| CreateToken `POST /auth`                   | bad credentials           | not documented | 200 OK + `reason` | Defect [BUG-001](bugs/BUG-001-auth-bad-credentials-returns-200.md)         |
| CreateBooking `POST /booking`              | valid body                | 200 OK         | 200 OK            | Matches                                                                    |
| CreateBooking `POST /booking`              | required field missing    | not documented | 500               | Defect [BUG-002](bugs/BUG-002-create-booking-missing-field-returns-500.md) |
| CreateBooking `POST /booking`              | malformed JSON            | not documented | 400               | Correct, documentation gap D-001                                           |
| GetBooking `GET /booking/{id}`             | existing id               | 200 OK         | 200 OK            | Matches                                                                    |
| GetBooking `GET /booking/{id}`             | unknown or non-numeric id | not documented | 404               | Correct, documentation gap D-001                                           |
| GetBookingIds `GET /booking`               | filter by name            | 200 OK         | 200 OK            | Matches                                                                    |
| UpdateBooking `PUT /booking/{id}`          | valid token               | 200 OK         | 200 OK            | Matches                                                                    |
| UpdateBooking `PUT /booking/{id}`          | no token or invalid token | not documented | 403               | Correct, documentation gap D-001                                           |
| PartialUpdateBooking `PATCH /booking/{id}` | valid token               | 200 OK         | 200 OK            | Matches                                                                    |
| DeleteBooking `DELETE /booking/{id}`       | valid token               | 201 Created    | 201 Created       | Defect [BUG-003](bugs/BUG-003-delete-booking-returns-201.md)               |
| DeleteBooking `DELETE /booking/{id}`       | no token                  | not documented | 403               | Correct, documentation gap D-001                                           |
| DeleteBooking, UpdateBooking               | booking already deleted   | not documented | 405               | Defect [BUG-004](bugs/BUG-004-deleted-booking-returns-405.md)              |

## Design observations

### O-001 - HealthCheck returns 201 Created (low severity)

`GET /ping` is documented as `201 Created` and returns `201 Created`. Doc and behaviour agree, so
this is not a documentation discrepancy. The semantic issue is the same as BUG-003: 201 means a
resource was created, and a health check creates nothing; `200 OK` would be expected. The test
asserts 201 as the normal expected status, without a known-bug flag.

## Documentation gaps

### D-001 - No error response is documented

The documentation lists only success responses. None of the error codes measured above (400,
403, 404, 405, 500) appears in it, so a client cannot know from the doc how failures are reported.

### D-002 - DeleteBooking example URL is hard-coded

The DeleteBooking entry documents the URL as `booking/1` instead of `booking/:id`, unlike the
other single-booking endpoints.

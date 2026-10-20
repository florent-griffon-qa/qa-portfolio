# US-001 - Create and find a booking

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| System     | Restful-Booker API                                             |
| Status     | Approved                                                       |
| Test cases | [US-001 test cases](../test-cases/US-001.md): QAP-T1 to QAP-T6 |

## Story

As a hotel booking client,
I want to create a booking and find it again by its id or by the guest name,
so that I can confirm and retrieve a reservation.

## Acceptance criteria

1. A booking with all required fields (firstname, lastname, totalprice, depositpaid, check-in and
   check-out dates) is created, and the response returns its id with the data sent.
2. A booking can be read by its id and returns the data sent at creation.
3. The list of booking ids can be filtered by guest first and last name.
4. A request with a missing required field or a malformed body is refused as a client error (4xx).
5. Reading an id that does not exist returns 404.

## Notes

- Criterion 4 is not met for a missing field: the API returns 500
  ([BUG-002](../../docs/bugs/BUG-002-create-booking-missing-field-returns-500.md)).

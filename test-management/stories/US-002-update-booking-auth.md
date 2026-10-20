# US-002 - Update and delete a booking with authentication

| Field      | Value                                                           |
| ---------- | --------------------------------------------------------------- |
| System     | Restful-Booker API                                              |
| Status     | Approved                                                        |
| Test cases | [US-002 test cases](../test-cases/US-002.md): QAP-T7 to QAP-T14 |

## Story

As a hotel administrator,
I want to change or cancel a booking only after authenticating,
so that guests' reservations cannot be modified by anyone else.

## Acceptance criteria

1. Valid credentials return a token; bad credentials are refused with 401 and no token.
2. With a valid token, a booking can be fully replaced (PUT) or partially updated (PATCH).
3. Without a token, or with an invalid one, update and delete are refused with 403.
4. With a valid token, a booking can be deleted; afterwards it is not found (404).
5. Any further update or delete on a deleted booking returns 404.

## Notes

- Criterion 1 is not met for bad credentials: 200 with a `reason` field
  ([BUG-001](../../docs/bugs/BUG-001-auth-bad-credentials-returns-200.md)).
- Criterion 4: the delete succeeds but answers 201 Created
  ([BUG-003](../../docs/bugs/BUG-003-delete-booking-returns-201.md)).
- Criterion 5 is not met: 405 instead of 404
  ([BUG-004](../../docs/bugs/BUG-004-deleted-booking-returns-405.md)).

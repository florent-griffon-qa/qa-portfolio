# Traceability matrix

User story -> test case -> automated test -> defect or observation.

- User stories and test cases: `test-management/` (test case keys follow the Zephyr Scale
  format `<PROJECT>-T<n>`, project key `QAP`).
- Postman requests: `postman/collections/restful-booker.postman_collection.json`, folder
  `Positive` (P01 to P09) and `Negative` (N01 to N12).
- Playwright tests: `playwright/tests/smoke/`.
- Defects and observations: [docs/bugs/](bugs/) and [API_DOC_ANALYSIS.md](API_DOC_ANALYSIS.md).

## US-001 - Create and find a booking

| Test case | Title                                          | Automated test(s)                     | Defect / observation                                                |
| --------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| QAP-T001  | Create a booking with valid data               | P03 CreateBooking, N02 CreateBooking  | -                                                                   |
| QAP-T002  | Read a booking by id                           | P04 GetBooking                        | -                                                                   |
| QAP-T003  | Find a booking by guest name                   | P05 GetBookingIds                     | -                                                                   |
| QAP-T004  | Reject a booking with a missing required field | N04 CreateBooking without firstname   | [BUG-002](bugs/BUG-002-create-booking-missing-field-returns-500.md) |
| QAP-T005  | Reject a malformed JSON body                   | N05 CreateBooking with malformed JSON | -                                                                   |
| QAP-T006  | Return 404 for an unknown or non-numeric id    | N06 GetBooking with non-numeric id    | -                                                                   |

## US-002 - Update and delete a booking with authentication

| Test case | Title                                                     | Automated test(s)                                                     | Defect / observation                                        |
| --------- | --------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| QAP-T007  | Get a token with valid credentials                        | P02 CreateToken, N01 CreateToken                                      | -                                                           |
| QAP-T008  | Refuse a token for bad credentials                        | N03 CreateToken with bad credentials                                  | [BUG-001](bugs/BUG-001-auth-bad-credentials-returns-200.md) |
| QAP-T009  | Update a booking with a valid token                       | P06 UpdateBooking                                                     | -                                                           |
| QAP-T010  | Partially update a booking with a valid token             | P07 PartialUpdateBooking                                              | -                                                           |
| QAP-T011  | Refuse an update without a token or with an invalid token | N07 UpdateBooking without token, N08 UpdateBooking with invalid token | -                                                           |
| QAP-T012  | Delete a booking with a valid token                       | P08 DeleteBooking, P09 GetBooking after delete, N10 DeleteBooking     | [BUG-003](bugs/BUG-003-delete-booking-returns-201.md)       |
| QAP-T013  | Refuse a delete without a token                           | N09 DeleteBooking without token                                       | -                                                           |
| QAP-T014  | Return 404 when acting on a deleted booking               | N11 DeleteBooking already deleted, N12 UpdateBooking already deleted  | [BUG-004](bugs/BUG-004-deleted-booking-returns-405.md)      |

## US-003 - Buy products on SauceDemo

| Test case | Title                                   | Automated test(s)                                                                                                              | Defect / observation |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| QAP-T015  | Standard user logs in                   | [login.spec.ts](../playwright/tests/smoke/login.spec.ts) "standard user lands on the product list"                             | -                    |
| QAP-T016  | Locked-out user is refused              | [login.spec.ts](../playwright/tests/smoke/login.spec.ts) "locked-out user is refused with an explicit error"                   | -                    |
| QAP-T017  | Wrong password is refused               | [login.spec.ts](../playwright/tests/smoke/login.spec.ts) "wrong password is refused"                                           | -                    |
| QAP-T018  | Buy two products with consistent totals | [checkout.spec.ts](../playwright/tests/smoke/checkout.spec.ts) "standard user buys two products and the totals are consistent" | -                    |
| QAP-T019  | Checkout information is required        | [checkout.spec.ts](../playwright/tests/smoke/checkout.spec.ts) "checkout information is required"                              | -                    |

Each Playwright test runs on chromium and firefox.

## Technical checks (no user story)

| Automated test  | Purpose                                    | Defect / observation                                                              |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| P01 HealthCheck | API availability before the Positive chain | [O-001](API_DOC_ANALYSIS.md#o-001---healthcheck-returns-201-created-low-severity) |

## Reverse view: defects and observations

| Id                                                                                | Summary                                               | Test case | Automated test(s) |
| --------------------------------------------------------------------------------- | ----------------------------------------------------- | --------- | ----------------- |
| [BUG-001](bugs/BUG-001-auth-bad-credentials-returns-200.md)                       | CreateToken returns 200 on bad credentials            | QAP-T008  | N03               |
| [BUG-002](bugs/BUG-002-create-booking-missing-field-returns-500.md)               | CreateBooking returns 500 on a missing required field | QAP-T004  | N04               |
| [BUG-003](bugs/BUG-003-delete-booking-returns-201.md)                             | DeleteBooking returns 201 Created                     | QAP-T012  | P08, N10          |
| [BUG-004](bugs/BUG-004-deleted-booking-returns-405.md)                            | DELETE or PUT on a deleted booking returns 405        | QAP-T014  | N11, N12          |
| [O-001](API_DOC_ANALYSIS.md#o-001---healthcheck-returns-201-created-low-severity) | HealthCheck returns 201 (design observation)          | -         | P01               |

## Coverage summary

| Story  | Test cases | Automated | Known defects |
| ------ | ---------- | --------- | ------------- |
| US-001 | 6          | 6         | 1             |
| US-002 | 8          | 8         | 3             |
| US-003 | 5          | 5         | 0             |

Every Postman request (P01 to P09, N01 to N12) and every Playwright test appears in this matrix.

## Coverage gaps

Known, deliberate gaps, candidates for the next iterations:

- API: `PATCH` without a token; `GetBookingIds` filtered by check-in and check-out dates;
  check-out date before check-in date; `additionalneeds` omitted; XML and URL-encoded payloads.
- UI: product sorting; removing a product from the cart; "Continue Shopping" and "Cancel"
  navigation; logout and "Reset App State"; last name and postal code required messages;
  special users (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`).

*** Settings ***
Documentation       Negative cases: bad credentials, missing field, unknown id, missing or invalid
...                 token, action on a deleted booking.
...
...                 Known API defects are characterization tests (see postman/README.md,
...                 "Known defects policy"): they assert the CURRENT behaviour and fail with
...                 "BUG-xxx may be fixed" the day the API changes.

Resource            ../../resources/api/booking_api.resource

Suite Setup         Prepare Negative Suite

Test Tags           api    negative


*** Test Cases ***
N01 CreateToken with bad credentials - KNOWN BUG BUG-001
    [Documentation]    BUG-001: returns 200 with a "reason" instead of 401. The whole response is
    ...    frozen (status, reason, no token) so that a partial fix is detected too.
    [Tags]    QAP-T8    known-bug    BUG-001
    ${response}=    Create Token    ${AUTH_USERNAME}    ${AUTH_PASSWORD}${INVALID_PASSWORD_SUFFIX}
    Status Should Be Known Bug    ${response}    bug=BUG-001    current=200    correct=401
    Should Be Equal    ${response.json()}[reason]    ${BAD_CREDENTIALS_REASON}
    Dictionary Should Not Contain Key    ${response.json()}    token

N02 CreateBooking without firstname - KNOWN BUG BUG-002
    [Documentation]    BUG-002: a missing required field returns 500 instead of 400.
    [Tags]    QAP-T4    known-bug    BUG-002
    ${body}=    Copy Dictionary    ${BOOKING}    deepcopy=${True}
    Remove From Dictionary    ${body}    firstname
    ${response}=    Create Booking    ${body}
    Status Should Be Known Bug    ${response}    bug=BUG-002    current=500    correct=400

N03 GetBooking with a non-numeric id returns 404
    [Tags]    QAP-T6
    ${response}=    Get Booking    ${UNKNOWN_BOOKING_ID}
    Status Should Be Exactly    ${response}    404

N04 UpdateBooking without a token returns 403
    [Tags]    QAP-T11
    ${response}=    Update Booking    ${BOOKING_ID}    ${BOOKING_UPDATE}
    Status Should Be Exactly    ${response}    403

N05 UpdateBooking with an invalid token returns 403
    [Tags]    QAP-T11
    ${response}=    Update Booking    ${BOOKING_ID}    ${BOOKING_UPDATE}    token=${INVALID_TOKEN}
    Status Should Be Exactly    ${response}    403

N06 DeleteBooking without a token returns 403
    [Tags]    QAP-T13
    ${response}=    Delete Booking    ${BOOKING_ID}
    Status Should Be Exactly    ${response}    403

N07 DeleteBooking on a deleted booking - KNOWN BUG BUG-004
    [Documentation]    BUG-004: acting on a deleted booking returns 405 instead of 404.
    ...    The first delete is a SETUP step (BUG-003 accepted there: 201).
    [Tags]    QAP-T14    known-bug    BUG-004
    ${setup}=    Delete Booking    ${BOOKING_ID}    token=${TOKEN}
    Status Should Be Known Bug    ${setup}    bug=BUG-003    current=201    correct=204
    ${response}=    Delete Booking    ${BOOKING_ID}    token=${TOKEN}
    Status Should Be Known Bug    ${response}    bug=BUG-004    current=405    correct=404


*** Keywords ***
Prepare Negative Suite
    [Documentation]    SETUP: opens the session, gets a valid token and creates the booking that
    ...    the negative tests work on.
    Open API Session
    ${token}=    Get Valid Token
    Set Suite Variable    ${TOKEN}    ${token}
    ${response}=    Create Booking    ${BOOKING}
    Status Should Be Exactly    ${response}    200
    Set Suite Variable    ${BOOKING_ID}    ${response.json()}[bookingid]

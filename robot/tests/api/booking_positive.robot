*** Settings ***
Documentation       Positive cases: full booking lifecycle (token, create, read, update, delete).
...
...                 The suite creates its own booking and deletes it: no test depends on existing
...                 data (repository rule 6). Tests run in order and share the booking id.
...                 Tags link each test to its Zephyr-style test case (test-management/).

Resource            ../../resources/api/booking_api.resource

Suite Setup         Open API Session

Test Tags           api    positive


*** Test Cases ***
P01 CreateToken returns a token for valid credentials
    [Tags]    QAP-T7
    ${response}=    Create Token    ${AUTH_USERNAME}    ${AUTH_PASSWORD}
    Status Should Be Exactly    ${response}    200
    Dictionary Should Contain Key    ${response.json()}    token
    Should Match Regexp    ${response.json()}[token]    ^[0-9a-f]+$
    Set Suite Variable    ${TOKEN}    ${response.json()}[token]

P02 CreateBooking returns the created booking and its id
    [Tags]    QAP-T1
    ${response}=    Create Booking    ${BOOKING}
    Status Should Be Exactly    ${response}    200
    ${body}=    Set Variable    ${response.json()}
    Should Be True    isinstance($body['bookingid'], int) and $body['bookingid'] > 0
    Booking Should Match    ${body}[booking]    ${BOOKING}
    Set Suite Variable    ${BOOKING_ID}    ${body}[bookingid]
    Log To Console    ${PLATFORM_API} booking created, id ${BOOKING_ID}

P03 GetBooking returns the booking that was created
    [Tags]    QAP-T2
    ${response}=    Get Booking    ${BOOKING_ID}
    Status Should Be Exactly    ${response}    200
    Booking Should Match    ${response.json()}    ${BOOKING}

P04 UpdateBooking replaces the booking with a valid token
    [Tags]    QAP-T9
    ${response}=    Update Booking    ${BOOKING_ID}    ${BOOKING_UPDATE}    token=${TOKEN}
    Status Should Be Exactly    ${response}    200
    Booking Should Match    ${response.json()}    ${BOOKING_UPDATE}

P05 DeleteBooking deletes the booking - KNOWN BUG BUG-003
    [Documentation]    BUG-003: DELETE returns 201 Created instead of 204 No Content.
    [Tags]    QAP-T12    known-bug    BUG-003
    ${response}=    Delete Booking    ${BOOKING_ID}    token=${TOKEN}
    Status Should Be Known Bug    ${response}    bug=BUG-003    current=201    correct=204

P06 GetBooking returns 404 after the delete
    [Tags]    QAP-T12
    ${response}=    Get Booking    ${BOOKING_ID}
    Status Should Be Exactly    ${response}    404

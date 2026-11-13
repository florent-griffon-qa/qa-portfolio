*** Settings ***
Documentation       Keywords for the Restful-Booker API (https://restful-booker.herokuapp.com/apidoc/index.html).
...
...                 HOW TO READ THIS FILE
...                 Each keyword below is a reusable step, like a Postman request plus its
...                 shared tests. The test files call these keywords by name, in plain English.
...
...                 RULES (same as the Postman collection)
...                 - Every request uses expected_status=any: the status is asserted by the test,
...                 never by the library, so a wrong status gives a readable failure message.
...                 - No literal test data here: values come from robot/variables/*.json.
...                 - Known API defects are asserted with "Status Should Be Known Bug"
...                 (see "Known defects policy" in postman/README.md).

Library             RequestsLibrary
Library             Collections


*** Variables ***
${SESSION}          restful-booker
&{JSON_HEADERS}     Content-Type=application/json    Accept=application/json


*** Keywords ***
Open API Session
    [Documentation]    Opens one HTTP session to the API under test. Called once per suite.
    Create Session    ${SESSION}    ${BASE_URL}    headers=${JSON_HEADERS}    verify=${True}
    Log To Console    \n${PLATFORM_API} API session opened on ${BASE_URL}

Create Token
    [Documentation]    POST /auth. Returns the full response (the test decides what to assert).
    [Arguments]    ${username}    ${password}
    &{body}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    ${SESSION}    /auth    json=${body}    expected_status=any
    RETURN    ${response}

Get Valid Token
    [Documentation]    SETUP step: gets a token with the valid credentials and checks it is present.
    ${response}=    Create Token    ${AUTH_USERNAME}    ${AUTH_PASSWORD}
    Status Should Be Exactly    ${response}    200
    Dictionary Should Contain Key    ${response.json()}    token
    RETURN    ${response.json()}[token]

Create Booking
    [Documentation]    POST /booking with the given body.
    [Arguments]    ${body}
    ${response}=    POST On Session    ${SESSION}    /booking    json=${body}    expected_status=any
    RETURN    ${response}

Get Booking
    [Documentation]    GET /booking/{id}.
    [Arguments]    ${booking_id}
    ${response}=    GET On Session    ${SESSION}    /booking/${booking_id}    expected_status=any
    RETURN    ${response}

Update Booking
    [Documentation]    PUT /booking/{id}. Pass token=${None} to send the request without a token.
    [Arguments]    ${booking_id}    ${body}    ${token}=${None}
    &{headers}=    Token Header    ${token}
    ${response}=    PUT On Session    ${SESSION}    /booking/${booking_id}
    ...    json=${body}    headers=${headers}    expected_status=any
    RETURN    ${response}

Delete Booking
    [Documentation]    DELETE /booking/{id}. Pass token=${None} to send the request without a token.
    [Arguments]    ${booking_id}    ${token}=${None}
    &{headers}=    Token Header    ${token}
    ${response}=    DELETE On Session    ${SESSION}    /booking/${booking_id}
    ...    headers=${headers}    expected_status=any
    RETURN    ${response}

Token Header
    [Documentation]    Builds the Cookie header expected by the API. Empty when there is no token.
    [Arguments]    ${token}
    IF    $token is None    RETURN    &{EMPTY}
    &{headers}=    Create Dictionary    Cookie=token=${token}
    RETURN    &{headers}

Status Should Be Exactly
    [Documentation]    Asserts the status code with a message that names the platform and the call.
    [Arguments]    ${response}    ${expected}
    Should Be Equal As Integers    ${response.status_code}    ${expected}
    ...    msg=${PLATFORM_API} ${response.request.method} ${response.request.path_url}: expected ${expected}, got ${response.status_code}. Body: ${response.text}
    ...    values=${False}

Status Should Be Known Bug
    [Documentation]    Characterization test for a known defect: asserts the CURRENT (wrong) status.
    ...    When the API is fixed, it fails with an actionable message instead of staying silent.
    [Arguments]    ${response}    ${bug}    ${current}    ${correct}
    Should Be Equal As Integers    ${response.status_code}    ${current}
    ...    msg=${bug} may be fixed: expected current behaviour ${current}, got ${response.status_code} (correct is ${correct}) - update the test and close the bug
    ...    values=${False}
    Log    KNOWN BUG ${bug}: returns ${current} instead of ${correct}    level=WARN

Booking Should Match
    [Documentation]    Compares every field of a booking returned by the API with the data that was sent.
    [Arguments]    ${actual}    ${expected}
    FOR    ${field}    IN    firstname    lastname    totalprice    depositpaid    additionalneeds
        Should Be Equal    ${actual}[${field}]    ${expected}[${field}]
        ...    msg=${PLATFORM_API} field "${field}": expected ${expected}[${field}], got ${actual}[${field}]
        ...    values=${False}
    END
    Should Be Equal    ${actual}[bookingdates][checkin]    ${expected}[bookingdates][checkin]
    Should Be Equal    ${actual}[bookingdates][checkout]    ${expected}[bookingdates][checkout]

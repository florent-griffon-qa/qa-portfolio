# Adding a request to the collection

Checklist to follow for every new request. The goal: any line in the Test Results can be traced
to its environment, request and test without opening the report.

## 1. Name

`<folder prefix><number> <official endpoint name>[ <case>]`, for example:

- `P04 GetBooking`
- `N07 UpdateBooking without token`

Use the endpoint name from the API documentation, never the URL path.

## 2. Pre-request script

Only when the expected status is not `200`, or when the request covers a known defect:

```js
// Expected status other than 200
pm.variables.set("expectedStatus", 404);

// Known defect: the test asserts the CURRENT behaviour (see "Known defects policy" in README.md)
pm.variables.set("expectedStatus", 405);
pm.variables.set("knownBug", "BUG-004");
pm.variables.set("correctStatus", "404");
```

When the request writes a free-text field, put the run reference in it:

```js
pm.variables.set("additionalNeeds", `N07 UpdateBooking - qa-portfolio run ${pm.collectionVariables.get("runTs")}`);
```

## 3. Test script

1. Start with the CONFIGURATION block and the `T01` status test, copied from an existing request.
2. Add `T02`, `T03`... for the body:
   - required fields: presence, format and value;
   - optional fields: format or value when it is specific (date, enum, number);
   - put the returned values in the test name, so they show up in the Test Results.
3. Save any value a later request needs in a collection variable, never a hard-coded id.
4. End with a `console.log` of the status and the start of the body.

## 4. Data

- No hard-coded booking id: the request uses the id created earlier in the same folder.
- No hard-coded value in the script body: test data lives in collection or environment variables.

## 5. Check

```bash
npm run test:api
npm run test:api:public
```

Both must be green before the commit.

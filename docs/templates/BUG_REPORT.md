# BUG-{nnn} - {endpoint or screen} {what it does wrong} {in which condition}

| Field       | Value                                                   |
| ----------- | ------------------------------------------------------- |
| Status      | Open                                                    |
| Severity    | Major / Minor                                           |
| Component   | {system}, `{endpoint or screen}`                        |
| Measured on | {YYYY-MM-DD}, {instance(s) and version or image digest} |
| Covered by  | {automated test id(s)}, or "not automated"              |

## Steps to reproduce

1. {step with the exact data}
2. {step}

## Expected

{correct behaviour}, per {reference: documentation section, RFC 9110 section, acceptance criterion}.

## Actual

{observed behaviour}. {Why it matters to a client.}

## Evidence

```text
{request}
-> {status}
{body, secrets replaced by <token>}
```

## Test policy

{How the automated test covers it, e.g. "The test asserts the current behaviour and is named
`KNOWN BUG BUG-{nnn}`. When the defect is fixed, the test fails with `BUG-{nnn} may be fixed`."}

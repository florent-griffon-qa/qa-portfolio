# Test management

User stories and test cases, written in the format of Zephyr Scale (Jira test management), with a
CSV ready for import.

```text
stories/            one file per user story: story, acceptance criteria, linked test cases
test-cases/         one file per story: every test case with its steps
zephyr-import.csv   the same test cases, in the Zephyr Scale CSV import format
```

The full chain, story to test case to automated test to defect, is in
[docs/TRACEABILITY.md](../docs/TRACEABILITY.md).

## Naming

| Item            | Format                                                                               | Example                              |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| User story      | `US-<nnn>`                                                                           | US-001                               |
| Test case key   | `QAP-T<n>`, Zephyr Scale format: project key, `-T`, a number that is not zero-padded | QAP-T7                               |
| Test case name  | Starts with a verb, states the expected outcome, unique in the project               | Refuse a token for bad credentials   |
| Postman request | `<P or N><nn> <endpoint name>[ <case>]`                                              | N03 CreateToken with bad credentials |
| Playwright test | Plain-language outcome, in a `describe` named after the feature                      | Login > wrong password is refused    |

## Test case content

Every test case has: an objective, a precondition, a priority (`High`, `Normal`, `Low`), labels,
a status, and steps with their test data and expected result. When it is automated, it names the
automated test (Postman request id or Playwright test title).

Labels:

| Label                   | Meaning                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `smoke`                 | Part of the fast suite run on every push (Playwright `@smoke`)                |
| `regression`            | Part of the full API suite                                                    |
| `positive` / `negative` | Valid input and expected success, or invalid input and expected refusal       |
| `known-defect`          | The expected result is not met today; the linked bug report describes the gap |
| `US-<nnn>`              | The user story the test case covers                                           |
| `automated`             | (CSV only) The test case has an automated test, see "Status" below            |

When a test case covers a known defect, its expected result states the CORRECT behaviour (the
requirement), followed by the current behaviour and the bug id. The automated test asserts the
current behaviour (see the Known defects policy in [postman/README.md](../postman/README.md#known-defects-policy)).

## Lifecycle

```text
Draft -> Approved -> Automated -> Deprecated
```

| Status     | Meaning                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| Draft      | Written, not reviewed                                                        |
| Approved   | Reviewed: objective, steps and expected results are correct and testable     |
| Automated  | An automated test covers it and runs in CI                                   |
| Deprecated | No longer relevant (feature removed or test case replaced); kept for history |

Zephyr Scale ships with the statuses `Draft`, `Approved` and `Deprecated` only. `Automated` is a
custom status that must be created in the Zephyr project settings first. So that the CSV imports
into a project with the default configuration, it uses `Approved` plus the label `automated`;
switch the status to `Automated` after import if the custom status exists.

## Importing into Zephyr Scale

1. In Jira, open Zephyr Scale > Tests > Import > CSV, and select `zephyr-import.csv`.
2. Map each CSV column to the Zephyr field of the same name.
3. Multi-step test cases: the first row of a test case holds all its fields and its first step;
   each following row holds only the next step (Step, Test Data, Expected Result) and leaves the
   other columns empty. Check in the import preview that the steps are grouped as expected, as
   the grouping option depends on the Zephyr Scale version.
4. Labels are comma-separated in a single cell.

### How repository keys map to imported test cases

Zephyr Scale assigns the keys itself at import: a key cannot be imposed, so the CSV has no key
column. The repository keys (`QAP-T1` to `QAP-T19`) are the keys used in this repository only.

The link between both is the test case Name, which is unique:

1. Import the CSV.
2. Export the imported test cases (or list them) with their Name and their Zephyr key.
3. Match each Zephyr key to the repository key by Name, using the tables in `test-cases/`.
4. If the Zephyr keys differ from the repository keys, record the mapping (repository key,
   Zephyr key, Name) next to the traceability matrix, or update the repository keys to the
   Zephyr keys in one commit.

When the Zephyr project is empty and the CSV rows are imported in order, Zephyr usually numbers
them `T1` to `T19` in the same order, but this is not guaranteed: always check by Name.

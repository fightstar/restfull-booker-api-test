# Restful-Booker API Tests (Playwright)

API test automation project for the public demo service  
https://restful-booker.herokuapp.com

This repository demonstrates real API testing practices using Playwright and TypeScript.

---

## Project Purpose

This project is created to practice and demonstrate:

- negative API testing  
- strict API contract validation  
- authentication boundary testing  
- domain validation checks  
- quality-gate style automation  
- detection of backend defects using automated tests  

The suite follows a **quality gate approach**:

- tests PASS only when API behaves correctly  
- tests FAIL when API accepts invalid input or crashes  

This simulates real production testing conditions.

---

## Tech Stack

- Playwright  
- TypeScript  
- Node.js  

---

## Target API

Base URL:

https://restful-booker.herokuapp.com

Main endpoints covered:

- POST /auth  
- POST /booking  
- GET /booking  
- GET /booking/{id}  
- PUT /booking/{id}  
- DELETE /booking/{id}  

---

## Negative Scenarios Covered

1. Invalid JSON body on create  
Expected: 4xx  
Must not return 5xx  

2. Missing required field (bookingdates)  
Expected: 4xx  
Actual API behavior: returns 500 → backend validation defect  

3. Wrong type: depositpaid = "true"  
Expected: request rejection  
Actual API behavior: silently normalizes value → weak validation  

4. Invalid domain data: checkout < checkin  
Expected: request rejection  
Actual API behavior: accepts logically impossible booking → domain defect  

5. Unauthorized update  
Expected: 401 or 403  

6. Authorized update sanity  
Expected: 200  
Confirms authentication works correctly  

---

## Project Structure

tests/  
└── restful-booker.negative.spec.ts  

package.json  
README.md  
.gitignore  

---

## Installation

Clone repository and install dependencies:

npm install  
npx playwright install  

---

## Run Tests

Run all tests:

npx playwright test  

Run with list reporter:

npx playwright test --reporter=list  

Run with HTML report:

npx playwright test --reporter=html  
npx playwright show-report  

---

## Expected Test Results

This suite intentionally produces a mix of:

- passing tests → correct API protections  
- failing tests → real API weaknesses  

Example failures:

- missing required field causes server crash (500)  
- invalid business logic accepted  
- weak type validation  

These failures are expected and represent detected defects.

---

## Future Improvements

Planned evolution of this project:

- introduce reusable API client layer  
- add test data builders  
- extend positive coverage  
- add cleanup flows  
- integrate GitHub Actions CI  
- publish HTML reports automatically  

---

## Notes

Restful-Booker is a public demo API.  
Behavior may occasionally be unstable.

Tests are intentionally strict to simulate real production quality gates.

---

Created for learning API test automation with Playwright.

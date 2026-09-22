# Mike Beron - Cypress Test Automation Assessment

End-to-end test automation for the DemoBlaze e-commerce application using **Cypress** and **TypeScript**.

The suite covers the required guest and authenticated purchase flows, negative scenarios, and regression checks for authentication, product, and cart functionality.

## Prerequisites

- Node.js 24.x LTS or later
- npm 10+
- Google Chrome
- Git

Verify the local environment:

```bash
node --version
npm --version
git --version
```

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/mikeberon/IONA-test-automation-quiz.git
cd IONA-test-automation-quiz
npm install
```

## Test Credentials

Authentication credentials are kept outside the test code and fixtures.

Create `cypress.env.json` in the project root:

```json
{
  "username": "<username>",
  "password": "<password>"
}
```

`cypress.env.json` is excluded through `.gitignore` and should not be committed.

Authentication tests retrieve only the credentials they need through `cy.env()`. Sensitive values are requested with Cypress logging disabled, and the deprecated `Cypress.env()` API is disabled in the Cypress configuration.

For CI/CD, credentials should be provided through the CI platform's secret store rather than committed configuration files.

## Project Structure

```text
cypress/
├── e2e/
│   └── mikeBeron/
│       ├── authentication.cy.ts
│       ├── checkout.cy.ts
│       └── regression.cy.ts
├── fixtures/
│   ├── customer.json
│   └── products.json
└── support/
    ├── helpers/
    │   └── cart.ts
    ├── pages/
    │   ├── cartPage.ts
    │   ├── homePage.ts
    │   ├── loginPage.ts
    │   └── productPage.ts
    ├── commands.ts
    └── e2e.ts
```

Responsibilities are separated by purpose:

- `authentication.cy.ts` - login and authentication validation
- `checkout.cy.ts` - guest/authenticated checkout and checkout validation
- `regression.cy.ts` - product and cart regression checks
- `fixtures/` - reusable non-sensitive test data
- `pages/` - page-specific selectors, interactions, and page-state checks
- `helpers/cart.ts` - shared add-to-cart workflow
- `commands.ts` - reusable Cypress commands such as login and controlled input

## Test Coverage and Traceability

| Requirement | TC | Automated Test |
|---|---|---|
| Authenticated purchase journey | TC-02 | Complete checkout as an authenticated user |
| Guest purchase journey | TC-03 | Complete checkout as a guest |
| Invalid login | TC-04 | Reject login with an incorrect password |
| Empty checkout form | TC-05 | Prevent checkout when required fields are empty |
| Additional negative scenario | TC-06 | Prevent checkout when credit card is empty |
| Additional negative scenario | TC-07 | Prevent checkout when customer name is empty |
| Additional negative scenario | TC-08 | Reject login when username and password are empty |
| Regression | TC-01 | Display the homepage |
| Regression | TC-09 | Log in with valid credentials |
| Regression | TC-10 | Display the correct product details |
| Regression | TC-11 | Add a product to the cart and verify the total |
| Regression | TC-12 | Remove a product from the cart |

## Running the Tests

Run the complete suite in headless Chrome:

```bash
npm run cy:run
```

Run with Chrome visible:

```bash
npm run cy:headed
```

Open Cypress:

```bash
npm run cy:open
```

Run a specific spec:

```bash
npm run cy:run -- --spec "cypress/e2e/mikeBeron/checkout.cy.ts"
```

## Tagged Execution

Tests are tagged using `@cypress/grep` to support targeted execution.

```bash
npm run test:smoke
npm run test:regression
npm run test:negative
npm run test:checkout
npm run test:authentication
```

Tag usage:

- `@smoke` - TC-01, TC-02, TC-03
- `@regression` - TC-01, TC-09, TC-10, TC-11, TC-12
- `@negative` - TC-04, TC-05, TC-06, TC-07, TC-08
- `@positive` - TC-02, TC-03, TC-09
- `@authentication` - TC-02, TC-04, TC-08, TC-09
- `@checkout` - TC-02, TC-03, TC-05, TC-06, TC-07
- `@cart` - TC-11, TC-12

## Reporting

The suite uses `cypress-mochawesome-reporter` to generate an HTML test report.

Reporting includes:

- Test and suite results
- Execution duration
- Pass/fail status
- Charts and summary information
- Failure details
- Embedded screenshots for failed tests

Cypress is configured with:

```typescript
screenshotOnRunFailure: true
```

Screenshots are captured automatically when a test fails. Passing tests do not generate screenshots to avoid unnecessary report artifacts.

Video recording is disabled for this assessment.

After a test run, the generated Mochawesome report can be found under the Cypress reports directory.

Generated reports, screenshots, and videos are runtime artifacts and should not be committed to source control.

## Implementation Notes

### Page Object Model

The suite uses a lightweight Page Object Model to separate page-specific selectors and interactions from the test scenarios.

The page objects are divided by application area:

- `HomePage` - homepage navigation, store validation, and product selection
- `ProductPage` - product details and add-to-cart interaction
- `CartPage` - cart operations and checkout interactions
- `LoginPage` - login modal, credential entry, and authentication state

Reusable workflows that span application areas remain separate from individual page objects. For example, the shared add-to-cart helper coordinates product selection and the add-to-cart operation.

The test specs retain scenario flow and scenario-specific expectations so the purpose of each test remains visible.

### Test Data

Reusable non-sensitive test data is separated from the test logic:

- `fixtures/customer.json` - checkout customer details
- `fixtures/products.json` - product name and expected price
- `cypress.env.json` - local authentication credentials

Credentials are intentionally kept out of fixtures, and `cypress.env.json` is ignored by Git.

### Input Handling

During test execution, DemoBlaze intermittently dropped characters in login and checkout input fields. For example, a complete value could be entered by Cypress but only part of the value would remain in the field.

The behavior was reproduced before adding a targeted workaround.

A reusable `typeSlowly()` command handles these inputs by entering the value one character at a time, re-querying the field between inputs, and asserting the final value.

This keeps the application-specific workaround in one place and avoids adding arbitrary fixed waits throughout the tests.

### Add-to-Cart Flow

The add-to-cart operation is shared by the checkout and regression tests and is kept in `support/helpers/cart.ts`.

The helper validates the operation at two points:

1. The native confirmation alert contains the expected `Product added` message.
2. The `POST /addtocart` request returns HTTP 200.

The network request is used for synchronization instead of a fixed wait:

```typescript
cy.intercept('POST', '**/addtocart').as('addToCart')

cy.wait('@addToCart')
    .its('response.statusCode')
    .should('eq', 200)
```

After the add-to-cart operation completes, each relevant test explicitly opens the cart and verifies that the expected product is displayed.

Keeping cart navigation outside the helper makes the navigation visible in the scenario and avoids unnecessary page transitions.

### Cart State and Synchronization

DemoBlaze can persist cart items between sessions, particularly for authenticated users.

The authenticated checkout scenario therefore establishes a known cart state before adding the product under test.

Cart cleanup uses DemoBlaze's cart network requests for synchronization rather than arbitrary fixed waits:

- `POST /viewcart` determines the current cart contents.
- `POST /deleteitem` confirms that a delete operation completed.
- The actual `Delete` control is awaited before attempting the UI interaction.

This was necessary because the cart container can be present before its product rows are rendered.

Negative checkout scenarios also remove the product they created after validating the expected checkout error because those scenarios intentionally stop before completing a purchase.

This prevents test-created cart data from affecting later scenarios or subsequent test runs.

### Purchase Validation

The successful checkout tests validate more than the presence of the success dialog.

The purchase confirmation is checked for:

- `Thank you for your purchase!`
- The transaction amount shown in the confirmation

The reported transaction amount must match the expected product price from the product fixture.

This verifies the business outcome of the checkout rather than treating the appearance of a success dialog alone as sufficient evidence of a successful purchase.

### Alert Handling

During execution of the shared add-to-cart flow, DemoBlaze returned two variations of the native confirmation message:

- `Product added.`
- `Product added`

These variations were encountered across tests that use the shared `addProductToCart()` workflow, including the checkout and cart regression scenarios (TC-02, TC-03, TC-05, TC-06, TC-07, TC-11, and TC-12).

The variation was not tied to a specific test case; the same add-to-cart operation could return either message across different executions.

Since both messages represent the same successful add-to-cart action, the shared helper accepts an optional trailing period:

```typescript
expect(message.trim()).to.match(/^Product added\.?$/)
```

The alert is not used as the only success condition. The helper also verifies that the `POST /addtocart` request returns HTTP 200, and the relevant scenario subsequently verifies that the expected product is displayed in the cart.

### Empty-Cart Behavior

The assessment lists checkout with no items in the cart as an example of an additional negative scenario.

I tested this behavior manually and found that DemoBlaze currently allows the checkout/purchase flow to continue with an empty cart.

I did not automate a test expecting the application to reject the flow because that assertion would not match the application's current behavior.

The three additional negative scenarios are therefore covered by:

- TC-06 - checkout without a credit card
- TC-07 - checkout without a customer name
- TC-08 - login with both username and password empty

## Test Approach

The suite focuses on readable, deterministic tests without adding unnecessary framework complexity.

The implementation uses:

- Lightweight Page Object Model
- Explicit scenario-level assertions
- Fixture-based non-sensitive test data
- Credentials separated from source control
- Network-based synchronization where applicable
- Controlled handling for observed input instability
- Test IDs for requirement traceability
- Tags for selective execution
- Cart state management for test isolation
- Purchase amount validation for successful checkout
- HTML reporting with failure screenshots

Page objects are intentionally focused rather than creating abstractions for every UI component. Shared workflows are extracted when there is demonstrated reuse rather than adding abstraction preemptively.

## Verification

Before finalizing the assessment, TypeScript and the complete Cypress suite were verified with:

```bash
npx tsc --noEmit
npm run cy:run
npm run cy:headed
```

TypeScript compilation completed without errors.

The complete Cypress suite passed:

```text
12 tests
12 passing
0 failing
```

The full suite was also executed consecutively during final stability checks to verify that cart state from a previous run did not affect the next execution.

The test suite completes without requiring manual browser interaction.
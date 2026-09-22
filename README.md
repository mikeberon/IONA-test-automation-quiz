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
- `helpers/cart.ts` - shared add-to-cart workflow across page objects
- `commands.ts` - reusable Cypress commands such as login and controlled input

## Test Coverage and Traceability

| Requirement | TC | Automated Test |
|---|---|---|
| Guest purchase journey | TC-02 | Complete checkout as a guest |
| Authenticated purchase journey | TC-03 | Complete checkout as an authenticated user |
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
- `@authentication` - TC-03, TC-04, TC-08, TC-09
- `@checkout` - TC-02, TC-03, TC-05, TC-06, TC-07
- `@cart` - TC-11, TC-12

## Implementation Notes

### Page Object Model

The suite uses a lightweight Page Object Model to separate page-specific selectors and interactions from the test scenarios.

The page objects are divided by application area:

- `HomePage` - homepage navigation, store validation, and product selection
- `ProductPage` - product details and add-to-cart interaction
- `CartPage` - cart operations and checkout interactions
- `LoginPage` - login modal, credential entry, and authentication state

Reusable workflows that span multiple pages remain separate from individual page objects. For example, the shared add-to-cart helper coordinates `HomePage`, `ProductPage`, and `CartPage`.

This keeps selectors in their relevant page objects while allowing the test specs to focus on scenario flow and expected behavior.

### Test Data

Reusable non-sensitive test data is separated from the test logic:

- `fixtures/customer.json` - checkout customer details
- `fixtures/products.json` - product name and expected price
- `cypress.env.json` - local authentication credentials

Credentials are intentionally kept out of the fixtures, and `cypress.env.json` is ignored by Git.

### Input Handling

During test execution, I observed DemoBlaze intermittently dropping characters in login and checkout input fields. For example, a complete value could be entered by Cypress but only part of the value would remain in the field.

I reproduced the issue before adding a workaround.

A reusable `typeSlowly()` command handles these inputs by entering the value one character at a time, re-querying the field between inputs, and asserting the final value.

This keeps the application-specific workaround in one place and avoids adding arbitrary waits throughout the tests.

### Add-to-Cart Flow

The add-to-cart flow is shared by the checkout and regression tests and is kept in `support/helpers/cart.ts`.

The helper coordinates the relevant page objects and validates the operation at three points:

1. The native confirmation alert contains the expected `Product added` message.
2. The `POST /addtocart` request returns HTTP 200.
3. The selected product is present in the cart.

The network request is used for synchronization instead of a fixed wait:

```typescript
cy.intercept('POST', '**/addtocart').as('addToCart')

cy.wait('@addToCart')
    .its('response.statusCode')
    .should('eq', 200)
```

This provides confirmation that the request completed successfully while the final cart assertion verifies the expected UI state.

### Alert Handling

DemoBlaze showed inconsistent punctuation in the native add-to-cart confirmation during test execution.

The following variations were observed:

- `Product added.`
- `Product added`

Since both messages represent the same successful add-to-cart action, the shared cart helper accepts an optional trailing period:

```typescript
expect(message.trim()).to.match(/^Product added\.?$/)
```

The alert is not used as the only success condition. The helper also checks the `/addtocart` response and verifies that the expected product is present in the cart.

### Empty-Cart Behavior

The assessment lists checkout with no items in the cart as an example of an additional negative scenario.

I tested this behavior manually and found that DemoBlaze currently allows the checkout/purchase flow to continue with an empty cart.

I did not automate a test expecting the application to reject the flow because that assertion would not match the application's current behavior.

The three additional negative scenarios are therefore covered by:

- TC-06 - checkout without a credit card
- TC-07 - checkout without a customer name
- TC-08 - login with both username and password empty

## Test Approach

The suite uses a lightweight Page Object Model to keep page-specific selectors and interactions separate from the test scenarios.

`HomePage`, `ProductPage`, `CartPage`, and `LoginPage` own the interactions for their respective areas of the application. Reusable workflows that span multiple pages, such as adding a product to the cart, remain in a shared helper rather than being tied to a single page object.

The specs retain the scenario flow and expected behavior so the intent of each test remains visible.

The suite also uses explicit assertions, network synchronization where applicable, fixture-based test data, test IDs for traceability, and tags for selective execution. The page objects are kept intentionally focused rather than creating abstractions for every UI component.

## Verification

Before finalizing the assessment, the suite was verified with:

```bash
npx tsc --noEmit
npm run cy:run
npm run cy:headed
```

TypeScript compilation completed without errors, and the full Cypress suite passed:

```text
12 tests
12 passing
0 failing
```

The test suite completes without requiring manual browser interaction.
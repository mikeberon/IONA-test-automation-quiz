# Mike Beron - Cypress Test Automation Assessment

This implementation contains automated end-to-end tests for the DemoBlaze application using **Cypress** and **TypeScript**.

The test suite covers authentication, guest and authenticated checkout flows, negative validation scenarios, and regression coverage for core product and cart functionality.

## Prerequisites

Ensure the following are installed:

- Node.js 24.x LTS or later
- npm 10+
- Google Chrome
- Git

Verify your installation:

```bash
node --version
npm --version
git --version
```

## Setup

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/mikeberon/IONA-test-automation-quiz.git
cd IONA-test-automation-quiz
npm install
```

## Environment Variables

Authentication tests use environment-specific credentials rather than storing credentials directly in the test code.

Create the following file in the project root:

```text
cypress.env.json
```

Add the test credentials:

```json
{
  "username": "<username>",
  "password": "<password>"
}
```

`cypress.env.json` is excluded through `.gitignore` and should not be committed to source control.

For a CI/CD environment, credentials should be supplied through the platform's secret-management mechanism rather than committed configuration files.

## Test Structure

Candidate tests are located under:

```text
cypress/e2e/mikeBeron/
├── authentication.cy.ts
├── checkout.cy.ts
└── regression.cy.ts
```

Reusable Cypress commands are defined in:

```text
cypress/support/commands.ts
```

### Test Responsibilities

**authentication.cy.ts**
- Valid user login
- Invalid credential validation
- Empty username/password validation

**checkout.cy.ts**
- Homepage verification
- Guest checkout
- Authenticated checkout
- Empty required checkout fields
- Missing credit card validation
- Missing customer name validation

**regression.cy.ts**
- Product details verification
- Add product to cart and verify total
- Remove product from cart

## Running the Tests

### Headless Chrome

Run the complete suite:

```bash
npm run cy:run:chrome
```

### Headed Chrome

Run the complete suite with the browser visible:

```bash
npm run cy:headed:chrome
```

### Run a Specific Spec

Example:

```bash
npm run cy:run:chrome -- --spec "cypress/e2e/mikeBeron/checkout.cy.ts"
```

## Test Coverage

The suite covers the primary DemoBlaze purchase journey and supporting validation scenarios:

- Homepage availability
- Product selection
- Product details
- Add-to-cart functionality
- Cart contents and total
- Product removal
- Valid authentication
- Invalid authentication
- Required login-field validation
- Guest checkout
- Authenticated checkout
- Required checkout-field validation
- Successful purchase confirmation

## Stability and Test Design

### Application-Aware Input Handling

During test execution, DemoBlaze intermittently dropped characters while Cypress entered values into some input fields.

A reusable `typeSlowly()` Cypress command was introduced to provide reliable input interaction and verify the resulting field value.

This avoids duplicating application-specific typing logic throughout the test suite.

### Add-to-Cart Synchronization

Adding a product to the cart performs an asynchronous request.

The tests intercept the Add-to-Cart request and wait for its successful completion before navigating to the cart:

```typescript
cy.intercept('POST', '**/addtocart').as('addToCart')

cy.wait('@addToCart')
    .its('response.statusCode')
    .should('eq', 200)
```

This provides deterministic synchronization rather than relying on arbitrary fixed waits such as `cy.wait(2000)`.

### Native Alert Handling

DemoBlaze displays a native `Product added` alert after adding an item.

The tests register the alert handler before triggering the action and verify the expected message, allowing execution to continue reliably in both headed and headless Chrome.

### Business-Level Assertions

Tests verify the resulting application state in addition to individual UI actions. Examples include:

- Confirming the selected product appears in the cart
- Verifying the cart total
- Confirming a deleted product no longer exists
- Verifying the successful purchase confirmation
- Confirming authentication did not succeed after invalid credentials

### Secrets Management

Credentials are not hard-coded in the automation suite.

Local execution uses an ignored `cypress.env.json` file, while a production CI/CD implementation should obtain credentials from the CI/CD platform's protected secret store.

## Execution Verification

The complete assessment suite was verified successfully in:

- Chrome - Headless
- Chrome - Headed

Both execution modes completed without manual browser interaction.
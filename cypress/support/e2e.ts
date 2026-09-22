// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { register as registerCypressGrep } from '@cypress/grep'

registerCypressGrep()

// Helper function to generate random email address
export const generateRandomEmail = (): string => {
  return `test${Date.now()}${Math.random().toString(36).substring(2, 8)}@test.com`;
};

// Make it available globally via Cypress namespace
declare global {
  namespace Cypress {
    interface Cypress {
      generateRandomEmail: () => string;
    }
  }
}

// Assign to Cypress global for easy access
(Cypress as any).generateRandomEmail = generateRandomEmail;
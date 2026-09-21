/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in to DemoBlaze using valid credentials.
       */
      login(username: string, password: string): Chainable<void>

      /**
       * Types into a DemoBlaze input using a controlled delay
       * and verifies the final value.
       */
      typeSlowly(
        selector: string,
        value: string,
        options?: {
          log?: boolean
        }
      ): Chainable<JQuery>
    }
  }
}

Cypress.Commands.add(
  'typeSlowly',
  (
    selector: string,
    value: string,
    options: { log?: boolean } = {}
  ) => {
    cy.get(selector)
      .should('be.visible')
      .and('not.be.disabled')
      .clear()
      .should('have.value', '')

    for (const character of value) {
      cy.get(selector)
        .should('be.visible')
        .type(character, {
          delay: 50,
          log: options.log ?? true
        })
    }

    return cy.get(selector)
      .should('have.value', value)
  }
)

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.get('#login2')
    .should('be.visible')
    .click()

  cy.get('#logInModal')
    .should('be.visible')

  cy.typeSlowly('#loginusername', username)

  cy.typeSlowly('#loginpassword', password, {
    log: false
  })

  cy.contains('#logInModal button', 'Log in')
    .should('be.visible')
    .and('be.enabled')
    .click()

  cy.get('#nameofuser')
    .should('be.visible')
    .and('contain.text', `Welcome ${username}`)
})

export { }
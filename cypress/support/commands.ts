/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Logs in to DemoBlaze using valid credentials
             */
            login(username: string, password: string): Chainable<void>
        }
    }
}

Cypress.Commands.add('login', (username: string, password: string) => {
    cy.get('#login2')
        .should('be.visible')
        .click()

    cy.get('#logInModal')
        .should('be.visible')

    cy.get('#loginusername')
        .should('be.visible')
        .clear()
        .type(username, { delay: 50 })
        .should('have.value', username)

    cy.get('#loginpassword')
        .should('be.visible')
        .clear()
        .type(password, {
            delay: 50,
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

export {}
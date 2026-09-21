describe('DemoBlaze - Authentication', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('should log in with valid credentials', () => {
        const username = Cypress.env('username')
        const password = Cypress.env('password')

        cy.log(`Username: ${username}`)
        cy.log(`Username length: ${username?.length}`)
        cy.log(`Password configured: ${Boolean(password)}`)

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

        cy.on('window:alert', (message) => {
            cy.log(`Login alert: ${message}`)
        })

        cy.contains('#logInModal button', 'Log in')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('#nameofuser')
            .should('be.visible')
            .and('contain.text', `Welcome ${username}`)
    })

})
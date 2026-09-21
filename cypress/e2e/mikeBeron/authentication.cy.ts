describe('DemoBlaze - Authentication', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('should log in with valid credentials', () => {
        const username = Cypress.env('username')
        const password = Cypress.env('password')

        expect(username, 'username environment variable')
            .to.be.a('string')
            .and.not.be.empty

        expect(password, 'password environment variable')
            .to.be.a('string')
            .and.not.be.empty

        cy.login(username, password)
    })

    it('should reject login with invalid credentials', () => {
        const username = Cypress.env('username')
        const invalidPassword = 'pw_invalid'

        expect(username, 'username environment variable')
            .to.be.a('string')
            .and.not.be.empty

        cy.get('#login2')
            .should('be.visible')
            .click()

        cy.get('#logInModal')
            .should('be.visible')

        // Valid username + intentionally invalid password
        cy.typeSlowly('#loginusername', username)

        cy.typeSlowly('#loginpassword', invalidPassword, {
            log: false
        })

        const alertSpy = cy.spy().as('loginAlert')

        cy.on('window:alert', alertSpy)

        cy.contains('#logInModal button', 'Log in')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('@loginAlert')
            .should('have.been.calledOnceWith', 'Wrong password.')

        // Verify authentication did not succeed
        cy.get('#nameofuser')
            .should('not.be.visible')
    })

    it('should reject login when username and password are empty', () => {
        cy.get('#login2')
            .should('be.visible')
            .click()

        cy.get('#logInModal')
            .should('be.visible')

        // Verify both fields are intentionally empty
        cy.get('#loginusername')
            .should('be.visible')
            .and('have.value', '')

        cy.get('#loginpassword')
            .should('be.visible')
            .and('have.value', '')

        // Intercept login validation alert
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('loginAlert')
        })

        cy.contains('#logInModal button', 'Log in')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('@loginAlert')
            .should(
                'have.been.calledOnceWith',
                'Please fill out Username and Password.'
            )

        // Verify authentication did not succeed
        cy.get('#nameofuser')
            .should('not.be.visible')
    })
})
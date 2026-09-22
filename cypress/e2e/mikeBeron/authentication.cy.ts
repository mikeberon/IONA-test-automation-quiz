describe('DemoBlaze - Authentication', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it(
        'TC-09 - should log in with valid credentials',
        { tags: ['@positive', '@authentication', '@regression'] },
        () => {
            cy.env(['username', 'password'], { log: false })
                .then(({ username, password }) => {
                    expect(Boolean(username), 'username is configured')
                        .to.be.true

                    expect(Boolean(password), 'password is configured')
                        .to.be.true

                    cy.login(username, password)
                })
        }
    )

    it(
        'TC-04 - should reject login with an incorrect password',
        { tags: ['@negative', '@authentication'] },
        () => {
            const invalidPassword = 'pw_invalid'

            cy.env(['username'], { log: false })
                .then(({ username }) => {
                    expect(Boolean(username), 'username is configured')
                        .to.be.true

                    cy.get('#login2')
                        .should('be.visible')
                        .click()

                    cy.get('#logInModal')
                        .should('be.visible')

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
                        .should(
                            'have.been.calledOnceWith',
                            'Wrong password.'
                        )

                    cy.get('#nameofuser')
                        .should('not.be.visible')
                })
        }
    )

    it(
        'TC-08 - should reject login when username and password are empty',
        { tags: ['@negative', '@authentication'] },
        () => {
            cy.get('#login2')
                .should('be.visible')
                .click()

            cy.get('#logInModal')
                .should('be.visible')

            cy.get('#loginusername')
                .should('be.visible')
                .and('have.value', '')

            cy.get('#loginpassword')
                .should('be.visible')
                .and('have.value', '')

            cy.window().then((win) => {
                cy.stub(win, 'alert' as keyof typeof win)
                    .as('loginAlert')
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

            cy.get('#nameofuser')
                .should('not.be.visible')
        }
    )
})
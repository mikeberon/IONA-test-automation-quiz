describe('DemoBlaze - Checkout', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('should display the homepage', () => {
        cy.get('#nava')
            .should('be.visible')
            .and('contain.text', 'PRODUCT STORE')
    })

    it('should complete a purchase as a guest', () => {
        const productName = 'Samsung galaxy s6'

        const customer = {
            name: 'Mike Beron',
            country: 'Philippines',
            city: 'Calamba',
            card: '4111111111111111',
            month: '09',
            year: '2028'
        }

        cy.contains('.hrefch', productName)
            .should('be.visible')
            .click()

        cy.on('window:alert', (message) => {
            expect(message).to.equal('Product added')
        })

        cy.contains('a', 'Add to cart')
            .should('be.visible')
            .click()

        cy.get('#cartur')
            .should('be.visible')
            .click()

        cy.get('#tbodyid')
            .should('be.visible')
            .and('contain.text', productName)

        cy.contains('button', 'Place Order')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('#orderModal')
            .should('be.visible')

        cy.get('#name')
            .should('be.visible')
            .and('not.be.disabled')
            .type(customer.name)

        cy.get('#country')
            .should('be.visible')
            .type(customer.country)

        cy.get('#city')
            .should('be.visible')
            .type(customer.city)

        cy.get('#card')
            .should('be.visible')
            .type(customer.card)

        cy.get('#month')
            .should('be.visible')
            .type(customer.month)

        cy.get('#year')
            .should('be.visible')
            .type(customer.year)

        cy.contains('#orderModal button', 'Purchase')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('.sweet-alert')
            .should('be.visible')
            .within(() => {
                cy.get('h2')
                    .should('have.text', 'Thank you for your purchase!')
            })
    })

    it('should complete a purchase as an authenticated user', () => {
        const username = Cypress.env('username')
        const password = Cypress.env('password')
        const productName = 'Samsung galaxy s6'

        const customer = {
            name: 'Mike Beron',
            country: 'Philippines',
            city: 'Calamba',
            card: '4111111111111111',
            month: '09',
            year: '2028'
        }

        expect(username, 'username environment variable')
            .to.be.a('string')
            .and.not.be.empty

        expect(password, 'password environment variable')
            .to.be.a('string')
            .and.not.be.empty

        cy.login(username, password)

        cy.contains('.hrefch', productName)
            .should('be.visible')
            .click()

        cy.on('window:alert', (message) => {
            expect(message).to.equal('Product added')
        })

        cy.contains('a', 'Add to cart')
            .should('be.visible')
            .click()

        cy.get('#cartur')
            .should('be.visible')
            .click()

        cy.get('#tbodyid')
            .should('be.visible')
            .and('contain.text', productName)

        cy.contains('button', 'Place Order')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('#orderModal')
            .should('be.visible')

        cy.get('#name')
            .should('be.visible')
            .type(customer.name)

        cy.get('#country')
            .should('be.visible')
            .type(customer.country)

        cy.get('#city')
            .should('be.visible')
            .type(customer.city)

        cy.get('#card')
            .should('be.visible')
            .type(customer.card)

        cy.get('#month')
            .should('be.visible')
            .type(customer.month)

        cy.get('#year')
            .should('be.visible')
            .type(customer.year)

        cy.contains('#orderModal button', 'Purchase')
            .should('be.visible')
            .and('be.enabled')
            .click()

        cy.get('.sweet-alert')
            .should('be.visible')
            .within(() => {
                cy.get('h2')
                    .should('have.text', 'Thank you for your purchase!')
            })
    })

})
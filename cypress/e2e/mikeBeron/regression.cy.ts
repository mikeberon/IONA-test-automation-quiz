describe('DemoBlaze - Regression', () => {

    const productName = 'Samsung galaxy s6'
    const productPrice = 360

    beforeEach(() => {
        cy.visit('/')
    })

    it('TC-10 - should display the correct product details', () => {
        cy.contains('.hrefch', productName)
            .should('be.visible')
            .click()

        cy.get('.name')
            .should('be.visible')
            .and('have.text', productName)

        cy.get('.price-container')
            .should('be.visible')
            .and('contain.text', `$${productPrice}`)
    })

    it('TC-11 - should add a product to the cart and display the correct total', () => {
        cy.intercept('POST', '**/addtocart').as('addToCart')

        cy.contains('.hrefch', productName)
            .should('be.visible')
            .click()

        cy.contains('a', 'Add to cart')
            .should('be.visible')
            .click()

        cy.wait('@addToCart')
            .its('response.statusCode')
            .should('eq', 200)

        cy.get('#cartur')
            .should('be.visible')
            .click()

        cy.contains('#tbodyid td', productName)
            .should('be.visible')

        cy.get('#totalp')
            .should('be.visible')
            .and('have.text', productPrice.toString())
    })

    it('TC-12 - should remove a product from the cart', () => {
        cy.intercept('POST', '**/addtocart').as('addToCart')

        cy.contains('.hrefch', productName)
            .should('be.visible')
            .click()

        cy.contains('a', 'Add to cart')
            .should('be.visible')
            .click()

        cy.wait('@addToCart')
            .its('response.statusCode')
            .should('eq', 200)

        cy.get('#cartur')
            .should('be.visible')
            .click()

        cy.contains('#tbodyid td', productName)
            .should('be.visible')

        cy.contains('#tbodyid tr', productName)
            .within(() => {
                cy.contains('a', 'Delete')
                    .should('be.visible')
                    .click()
            })

        cy.contains('#tbodyid td', productName)
            .should('not.exist')
    })
})
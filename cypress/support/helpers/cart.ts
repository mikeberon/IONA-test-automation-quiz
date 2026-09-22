export const addProductToCart = (productName: string) => {
    cy.intercept('POST', '**/addtocart').as('addToCart')

    cy.contains('.hrefch', productName)
        .should('be.visible')
        .click()

    cy.once('window:alert', (message) => {
        expect(message.trim()).to.match(/^Product added\.?$/)
    })

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
}
import productData from '../../fixtures/products.json'
import { addProductToCart } from '../../support/helpers/cart'

describe('DemoBlaze - Regression', () => {

    const productName = productData.samsungGalaxyS6.name
    const productPrice = productData.samsungGalaxyS6.price

    beforeEach(() => {
        cy.visit('/')
    })

    it(
        'TC-10 - should display the correct product details',
        { tags: ['@regression'] },
        () => {
            cy.contains('.hrefch', productName)
                .should('be.visible')
                .click()

            cy.get('.name')
                .should('be.visible')
                .and('have.text', productName)

            cy.get('.price-container')
                .should('be.visible')
                .and('contain.text', `$${productPrice}`)
        }
    )

    it(
        'TC-11 - should add a product to the cart and display the correct total',
        { tags: ['@regression', '@cart'] },
        () => {
            addProductToCart(productName)

            cy.get('#totalp')
                .should('be.visible')
                .and('have.text', productPrice.toString())
        }
    )

    it(
        'TC-12 - should remove a product from the cart',
        { tags: ['@regression', '@cart'] },
        () => {
            addProductToCart(productName)

            cy.contains('#tbodyid tr', productName)
                .within(() => {
                    cy.contains('a', 'Delete')
                        .should('be.visible')
                        .click()
                })

            cy.contains('#tbodyid td', productName)
                .should('not.exist')
        }
    )
})
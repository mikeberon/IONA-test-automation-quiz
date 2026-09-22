import customerData from '../../fixtures/customer.json'
import productData from '../../fixtures/products.json'
import { addProductToCart } from '../../support/helpers/cart'

type Customer = {
    name: string
    country: string
    city: string
    card: string
    month: string
    year: string
}

const customer: Customer = customerData.validCustomer
const productName = productData.samsungGalaxyS6.name

const openCheckout = () => {
    cy.contains('button', 'Place Order')
        .should('be.visible')
        .and('be.enabled')
        .click()

    cy.get('#orderModal')
        .should('be.visible')
}

const fillCheckoutForm = (customer: Customer) => {
    cy.typeSlowly('#name', customer.name)
    cy.typeSlowly('#country', customer.country)
    cy.typeSlowly('#city', customer.city)
    cy.typeSlowly('#card', customer.card)
    cy.typeSlowly('#month', customer.month)
    cy.typeSlowly('#year', customer.year)
}

const clickPurchase = () => {
    cy.contains('#orderModal button', 'Purchase')
        .scrollIntoView()
        .should('be.visible')
        .and('be.enabled')
        .click()
}

describe('DemoBlaze - Checkout', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it(
        'TC-01 - should display the homepage',
        { tags: ['@smoke', '@regression'] },
        () => {
            cy.get('#nava')
                .should('be.visible')
                .and('contain.text', 'PRODUCT STORE')
        }
    )

    it(
        'TC-02 - should complete checkout as a guest',
        { tags: ['@smoke', '@positive', '@checkout'] },
        () => {
            addProductToCart(productName)
            openCheckout()

            fillCheckoutForm(customer)
            clickPurchase()

            cy.get('.sweet-alert')
                .should('be.visible')
                .within(() => {
                    cy.get('h2')
                        .should('have.text', 'Thank you for your purchase!')
                })
        }
    )

    it(
        'TC-03 - should complete checkout as an authenticated user',
        { tags: ['@smoke', '@positive', '@checkout', '@authentication'] },
        () => {
            cy.env(['username', 'password'], { log: false })
                .then(({ username, password }) => {
                    expect(Boolean(username), 'username is configured')
                        .to.be.true

                    expect(Boolean(password), 'password is configured')
                        .to.be.true

                    cy.login(username, password)

                    addProductToCart(productName)
                    openCheckout()

                    fillCheckoutForm(customer)
                    clickPurchase()

                    cy.get('.sweet-alert')
                        .should('be.visible')
                        .within(() => {
                            cy.get('h2')
                                .should('have.text', 'Thank you for your purchase!')
                        })
                })
        }
    )

    it(
        'TC-05 - should prevent checkout when required fields are empty',
        { tags: ['@negative', '@checkout'] },
        () => {
            addProductToCart(productName)
            openCheckout()

            cy.get('#name')
                .should('have.value', '')

            cy.get('#card')
                .should('have.value', '')

            cy.window().then((win) => {
                cy.stub(win, 'alert' as keyof typeof win)
                    .as('checkoutAlert')
            })

            clickPurchase()

            cy.get('@checkoutAlert')
                .should(
                    'have.been.calledOnceWith',
                    'Please fill out Name and Creditcard.'
                )

            cy.get('#orderModal')
                .should('be.visible')
        }
    )

    it(
        'TC-06 - should prevent checkout when credit card is empty',
        { tags: ['@negative', '@checkout'] },
        () => {
            addProductToCart(productName)
            openCheckout()

            cy.typeSlowly('#name', customer.name)

            cy.get('#card')
                .should('have.value', '')

            cy.window().then((win) => {
                cy.stub(win, 'alert' as keyof typeof win)
                    .as('checkoutAlert')
            })

            clickPurchase()

            cy.get('@checkoutAlert')
                .should(
                    'have.been.calledOnceWith',
                    'Please fill out Name and Creditcard.'
                )

            cy.get('#orderModal')
                .should('be.visible')
        }
    )

    it(
        'TC-07 - should prevent checkout when customer name is empty',
        { tags: ['@negative', '@checkout'] },
        () => {
            addProductToCart(productName)
            openCheckout()

            cy.get('#name')
                .should('have.value', '')

            cy.typeSlowly('#card', customer.card)

            cy.window().then((win) => {
                cy.stub(win, 'alert' as keyof typeof win)
                    .as('checkoutAlert')
            })

            clickPurchase()

            cy.get('@checkoutAlert')
                .should(
                    'have.been.calledOnceWith',
                    'Please fill out Name and Creditcard.'
                )

            cy.get('#orderModal')
                .should('be.visible')
        }
    )
})
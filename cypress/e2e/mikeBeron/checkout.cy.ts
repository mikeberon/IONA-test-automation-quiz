import customerData from '../../fixtures/customer.json'
import productData from '../../fixtures/products.json'

type Customer = {
    name: string
    country: string
    city: string
    card: string
    month: string
    year: string
}

const productName = 'Samsung galaxy s6'

const customer: Customer = {
    name: 'Mike Beron',
    country: 'Philippines',
    city: 'Calamba',
    card: '4111111111111111',
    month: '09',
    year: '2028'
}

const addProductToCart = (productName: string) => {
    cy.intercept('POST', '**/addtocart').as('addToCart')

    cy.contains('.hrefch', productName)
        .should('be.visible')
        .click()

    cy.contains('a', 'Add to cart')
        .should('be.visible')
        .click()

    // Wait until DemoBlaze finishes adding the product
    cy.wait('@addToCart')
        .its('response.statusCode')
        .should('eq', 200)

    cy.get('#cartur')
        .should('be.visible')
        .click()

    // Verify the actual product appears in the cart
    cy.contains('#tbodyid td', productName)
        .should('be.visible')
}

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

    it('TC-01 - should display the homepage', () => {
        cy.get('#nava')
            .should('be.visible')
            .and('contain.text', 'PRODUCT STORE')
    })

    it('TC-02 - should complete checkout as a guest', () => {
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

    it('TC-03 - should complete a purchase as an authenticated user', () => {
        const username = Cypress.env('username')
        const password = Cypress.env('password')

        expect(username, 'username environment variable')
            .to.be.a('string')
            .and.not.be.empty

        expect(password, 'password environment variable')
            .to.be.a('string')
            .and.not.be.empty

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

    it('TC-05 - should prevent checkout when required fields are empty', () => {
        addProductToCart(productName)
        openCheckout()

        cy.get('#name')
            .should('have.value', '')

        cy.get('#card')
            .should('have.value', '')

        // Intercept checkout validation alert
        cy.window().then((win) => {
            cy.stub(win, 'alert' as keyof typeof win).as('checkoutAlert')
        })

        clickPurchase()

        cy.get('@checkoutAlert')
            .should(
                'have.been.calledOnceWith',
                'Please fill out Name and Creditcard.'
            )

        // Checkout modal should remain open
        cy.get('#orderModal')
            .should('be.visible')
    })

    it('TC-06 - should prevent checkout when credit card is empty', () => {
        addProductToCart(productName)
        openCheckout()

        // Name is provided
        cy.typeSlowly('#name', customer.name)

        // Credit Card intentionally left empty
        cy.get('#card')
            .should('have.value', '')

        // Intercept checkout validation alert
        cy.window().then((win) => {
            cy.stub(win, 'alert' as keyof typeof win).as('checkoutAlert')
        })

        clickPurchase()

        cy.get('@checkoutAlert')
            .should(
                'have.been.calledOnceWith',
                'Please fill out Name and Creditcard.'
            )

        // Checkout modal should remain open
        cy.get('#orderModal')
            .should('be.visible')
    })

    it('TC-07 - should prevent checkout when name is empty', () => {
        addProductToCart(productName)
        openCheckout()

        // Name intentionally left empty
        cy.get('#name')
            .should('have.value', '')

        // Credit Card is provided
        cy.typeSlowly('#card', customer.card)

        // Intercept checkout validation alert
        cy.window().then((win) => {
            cy.stub(win, 'alert' as keyof typeof win).as('checkoutAlert')
        })

        clickPurchase()

        cy.get('@checkoutAlert')
            .should(
                'have.been.calledOnceWith',
                'Please fill out Name and Creditcard.'
            )

        // Checkout modal should remain open
        cy.get('#orderModal')
            .should('be.visible')
    })
})
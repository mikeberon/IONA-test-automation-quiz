export type Customer = {
    name: string
    country: string
    city: string
    card: string
    month: string
    year: string
}

export class CartPage {

    private get cartLink() {
        return cy.get('#cartur')
    }

    private get total() {
        return cy.get('#totalp')
    }

    private get checkoutModal() {
        return cy.get('#orderModal')
    }

    private get nameInput() {
        return cy.get('#name')
    }

    private get cardInput() {
        return cy.get('#card')
    }

    open() {
        this.cartLink
            .should('be.visible')
            .click()
    }

    getProduct(productName: string) {
        return cy.contains('#tbodyid td', productName)
    }

    verifyProductIsDisplayed(productName: string) {
        this.getProduct(productName)
            .should('be.visible')
    }

    verifyProductIsRemoved(productName: string) {
        this.getProduct(productName)
            .should('not.exist')
    }

    verifyTotal(expectedPrice: number) {
        this.total
            .should('be.visible')
            .and('have.text', expectedPrice.toString())
    }

    removeProduct(productName: string) {
        cy.contains('#tbodyid tr', productName)
            .within(() => {
                cy.contains('a', 'Delete')
                    .should('be.visible')
                    .click()
            })
    }

    openCheckout() {
        cy.contains('button', 'Place Order')
            .should('be.visible')
            .and('be.enabled')
            .click()

        this.checkoutModal
            .should('be.visible')
    }

    fillCheckoutForm(customer: Customer) {
        cy.typeSlowly('#name', customer.name)
        cy.typeSlowly('#country', customer.country)
        cy.typeSlowly('#city', customer.city)
        cy.typeSlowly('#card', customer.card)
        cy.typeSlowly('#month', customer.month)
        cy.typeSlowly('#year', customer.year)
    }

    enterName(name: string) {
        cy.typeSlowly('#name', name)
    }

    enterCard(card: string) {
        cy.typeSlowly('#card', card)
    }

    verifyNameIsEmpty() {
        this.nameInput
            .should('have.value', '')
    }

    verifyCardIsEmpty() {
        this.cardInput
            .should('have.value', '')
    }

    clickPurchase() {
        cy.contains('#orderModal button', 'Purchase')
            .scrollIntoView()
            .should('be.visible')
            .and('be.enabled')
            .click()
    }

    verifyCheckoutIsDisplayed() {
        this.checkoutModal
            .should('be.visible')
    }
}

export const cartPage = new CartPage()
export class ShopPage {

  goToBuyPage() {
    cy.contains('a', 'Buy weapons').click();
  }

  goToSellPage() {
    cy.contains('a', 'Sell weapons').click();
  }

  returnToMenu() {
    cy.contains('a', 'Done').click();
  }

  leaveShop() {
    cy.contains('a', 'Go back to Main Hall').click();
  }

  expectGoldAmount(amount) {
    cy.get('[data-qa="goldAmount"]').should('have.text', amount);
  }

}

export const onShopPage = new ShopPage();

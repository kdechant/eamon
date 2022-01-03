export class AdventurePage {

  enterCommand(command) {
    cy.get('#command').type(`${command}{enter}`);
    cy.wait(500);
  }

  clickModalButton(text) {
    cy.contains('.game-modal button', text).click();
  }

  clickReturnButton(text) {
    cy.get('button#return').click({force: true});
  }

  clickSaveButton(text) {
    cy.contains('button', 'Save and go to main hall').click();
  }

}

export const onAdventurePage = new AdventurePage();

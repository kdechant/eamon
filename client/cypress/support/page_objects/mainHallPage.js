export class MainHallPage {

  goToAdventures() {
    cy.contains('a', 'Go on an adventure').click();
  }

  goToShop() {
    cy.contains('a', 'Visit the weapons shop').click();
  }

  goToBank() {
    cy.contains('a', 'Find the banker to deposit or withdraw some gold').click();
  }

  goToWizard() {
    cy.contains('a', 'Find a wizard to teach you some spells').click();
  }

  goToWitch() {
    cy.contains('a', 'Visit the witch to increase your attributes').click();
  }

  logOut() {
    cy.contains('a', 'Temporarily leave the universe').click();
  }

}

export const onMainHallPage = new MainHallPage();

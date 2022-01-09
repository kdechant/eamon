import {onMainHallPage} from "../support/page_objects/mainHallPage";
import {onAdventurePage} from "../support/page_objects/adventurePage";

describe('Adventure', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/players/*.json*', {fixture: 'character.json'});
    cy.intercept('PUT', '**/players/*', {fixture: 'character.json'});
    cy.intercept('GET', '**/adventures.json', {fixture: 'adventures.json'});
    // Adventure data for demo1 is loaded from files in build/mock-data and does not use XHR.
    // So, no mocking for this in Cypress.
    cy.intercept('POST', '**/api/log', {
      statusCode: 200,
      body: []
    });
  });

  it('can go on an adventure and exit to main hall', () => {
    localStorage.setItem('player_id', '1');
    cy.visit('/main-hall/hall');
    onMainHallPage.goToAdventures();
    cy.get('.adventure-list-item a').eq(0).click();
    cy.url().should('match', /adventure\/demo1\/$/);
    // TODO: interact with intro text (but it's usually turned off in debug mode). (Could fix this
    //  with a local storage variable.)
    // TODO: assert some UI stuff
    cy.get('.player-stats .heading').should('contain.text', 'Birgitte');
    cy.wait(1000);  // TODO: need to force update components so the 'ready' flag is correct
    cy.get('#command').should('have.class', 'ready');
    cy.get('.history-results').then(results => {
      expect(results).to.have.length(6);
      expect(results[5]).to.contain('You see a loaf of bread.');
    })
    onAdventurePage.enterCommand('s');

    // Answer NO to stay
    onAdventurePage.clickModalButton('No');
    cy.get('.history-command').last().should('contain.text', 'south');

    // YES to leave
    // after saying 'no' we need to type something to get the game ready again
    onAdventurePage.enterCommand('s');
    cy.wait(200);
    cy.get('#command').type('{enter}');
    onAdventurePage.clickModalButton('Yes');
    onAdventurePage.clickReturnButton();
    cy.get('.parchment').should('contain.text', 'you deliver your goods to Sam Slicker');
    onAdventurePage.clickSaveButton();
    cy.url().should('match', /main-hall\/hall$/);
  });

  it('can sell weapons when exiting', () => {
    localStorage.setItem('player_id', '1');
    cy.visit('/main-hall/adventure');
    cy.get('.adventure-list-item a').eq(0).click();
    cy.url().should('match', /adventure\/demo1\/$/);
    cy.wait(1000);  // TODO: need to force update components so the 'ready' flag is correct
    cy.get('#command').should('have.class', 'ready');
    cy.get('.history-results').then(results => {
      expect(results).to.have.length(6);
      expect(results[5]).to.contain('You see a loaf of bread.');
    })
    onAdventurePage.enterCommand('xaccio magic sword');
    onAdventurePage.enterCommand('xaccio spear');
    onAdventurePage.enterCommand('s');
    onAdventurePage.clickModalButton('Yes');
    onAdventurePage.clickReturnButton();
    cy.get('.parchment').should('contain.text', 'Lord William Missilefire');
    cy.get('.artifacts-list button').first().click();
    cy.get('.parchment').should('contain.text', 'you deliver your goods to Sam Slicker');
    onAdventurePage.clickSaveButton();
    cy.url().should('match', /main-hall\/hall$/);
  });

});

describe('Main Hall', () => {
  it('Visits the home page', () => {

    cy.intercept('GET', '**/players.json*', {fixture: 'characters.json'});

    cy.visit('/');
    cy.contains('Enter the Main Hall').click();
    cy.url().should('match', /main-hall$/);

    cy.get('.player').then(players => {
      expect(players).to.have.length(3);
      cy.wrap(players[0]).find('.icon > img').should('have.attr', 'src').and('match', /sword2.png$/);
      cy.wrap(players[0]).contains('HD: 27');
      cy.wrap(players[0]).contains('AG: 16');
      cy.wrap(players[0]).contains('CH: 20');
      cy.wrap(players[0]).contains('Magic sword');
      cy.wrap(players[1]).find('.icon > img').should('have.attr', 'src').and('match', /axe.png$/);
      cy.wrap(players[2]).find('.icon > img').should('have.attr', 'src').and('match', /helmet.png$/);
    });
  });
});

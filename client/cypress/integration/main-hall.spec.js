describe('Main Hall - Player Login and Logout', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/players.json*', {fixture: 'characters.json'});
    cy.intercept('GET', '**/players/*.json*', {fixture: 'character.json'});
    cy.intercept('PUT', '**/players/*.json*', {fixture: 'character.json'});
  })

  it('Visits the player list', () => {
    cy.visit('/');
    cy.contains('Enter the Main Hall').click();
    cy.url().should('match', /main-hall$/);

    cy.get('.player').then(players => {
      expect(players).to.have.length(3);
      cy.wrap(players[0]).find('.icon > img').should('have.attr', 'src').and('match', /sword2.png$/);
      cy.wrap(players[0]).should('contain.text','HD: 27');
      cy.wrap(players[0]).should('contain.text','AG: 16');
      cy.wrap(players[0]).should('contain.text','CH: 20');
      cy.wrap(players[0]).should('contain.text','Magic sword');
      cy.wrap(players[1]).find('.icon > img').should('have.attr', 'src').and('match', /axe.png$/);
      cy.wrap(players[2]).find('.icon > img').should('have.attr', 'src').and('match', /helmet.png$/);
    });
  });

  it('Loads a character', () => {
    cy.visit('/main-hall');
    cy.contains('Aragorn').click().should(() => {
      expect(localStorage.getItem('player_id')).to.equal('1');
    });
    cy.url().should('match', /main-hall\/hall$/);
    cy.get('.status-widget.player').then(widget => {
      expect(widget).to.contain('You are the mighty Aragorn');
      expect(widget).to.contain('HD: 27');
      expect(widget).to.contain('AG: 16');
      expect(widget).to.contain('CH: 20');
    })

    cy.get('.inventory .row').then(invRows => {
      expect(invRows).to.have.length(3);
      expect(invRows[0]).to.contain('Magic sword');
      expect(invRows[1]).to.contain('Shield');
      expect(invRows[2]).to.contain('Plate armor');
    });

  });

  it('can log out', () => {
    localStorage.setItem('player_id', 1);
    cy.visit('/main-hall/hall');
    cy.contains('a', 'Temporarily leave').click().should(() => {
      expect(localStorage.getItem('player_id')).to.equal(null);
    });
    cy.url().should('match', /main-hall$/);
  });

});

describe('Main Hall - Adventure List', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/players/*.json*', {fixture: 'character.json'});
    cy.intercept('GET', '**/adventures.json', {fixture: 'adventures.json'});
  })

  it('can filter by tag', () => {
    localStorage.setItem('player_id', '1');
    cy.visit('/main-hall/adventure');

    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#1');
      cy.wrap(advs[0]).find('a').should('have.text', 'Test Adv 1');
      cy.wrap(advs[1]).find('.adv-id').should('have.text', '#2');
      cy.wrap(advs[1]).find('a').should('have.text', 'Test Adv 2');
    });

    cy.get('.filter-tag .tag').then(tags => {
      expect(tags).to.have.length(3);
      expect(tags[0]).to.contain('all');
      expect(tags[1]).to.contain('tag1');
      expect(tags[2]).to.contain('tag2');
    });

    cy.get('.filter-tag .tag a').eq(1).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(1);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#1');
    });

    cy.get('.filter-tag .tag a').eq(2).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(1);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#2');
    });

    cy.get('.filter-tag .tag a').eq(2).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
    });

  });

  it('can filter by author', () => {
    localStorage.setItem('player_id', '1');
    cy.visit('/main-hall/adventure');

    // Note: this assertion causes Cypress to wait for the data loading to finish.
    // Without it, the other assertions will run too early.
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
    });

    cy.get('.filter-author .tag').then(authors => {
      expect(authors).to.have.length(3);
      expect(authors[0]).to.contain('all');
      expect(authors[1]).to.contain('Donald Brown');
      expect(authors[2]).to.contain('Tom Zuchowski');
    });

    cy.get('.filter-author .tag a').eq(1).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(1);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#1');
    });

    cy.get('.filter-author .tag a').eq(2).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(1);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#2');
    });

    cy.get('.filter-author .tag a').eq(2).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
    });

  });

  it('can sort', () => {
    localStorage.setItem('player_id', '1');
    cy.visit('/main-hall/adventure');

    // Note: this assertion causes Cypress to wait for the data loading to finish.
    // Without it, the other assertions will run too early.
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
    });

    cy.get('.filter-sort .tag').then(sortOptions => {
      expect(sortOptions).to.have.length(4);
      expect(sortOptions[0]).to.contain('alphabetical');
      expect(sortOptions[1]).to.contain('most popular');
      expect(sortOptions[2]).to.contain('newest');
      expect(sortOptions[3]).to.contain('original adventure number');
    });

    // Note: the default is alphabetical, so we start with a different one and test alphabetical
    // afterward.

    // most popular => 2, 1
    cy.get('.filter-sort .tag a').eq(1).click();
    cy.get('.filter-sort .tag a').should('have.class', 'font-weight-bold');
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#2');
    });

    // alphabetical => 1, 2
    cy.get('.filter-sort .tag a').eq(0).click();
    cy.get('.filter-sort .tag a').should('have.class', 'font-weight-bold');
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#1');
    });

    // newest => 2, 1
    cy.get('.filter-sort .tag a').eq(2).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#2');
    });

    // original number => 1, 2
    cy.get('.filter-sort .tag a').eq(3).click();
    cy.get('.adventure-list-item').then(advs => {
      expect(advs).to.have.length(2);
      cy.wrap(advs[0]).find('.adv-id').should('have.text', '#1');
    });

  });

});

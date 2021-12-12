describe('Character Creation', () => {
  it('Can navigate to the form', () => {
    cy.visit('/main-hall')
    cy.contains('Create a New Adventurer').click();
    cy.url().should('match', /main-hall\/register/);
  });

  it('Validates the form', () => {
    cy.contains("Begin Your Adventuring Career").click();
    cy.url().should('match', /main-hall\/register$/);
    cy.contains("Please enter a name");
    // TODO: validate gender too (but it's currently broken)
  });

  it('Can create a character', () => {
    cy.visit('/main-hall')
    cy.contains('Create a New Adventurer').click();
    cy.url().should('match', /main-hall\/register/);
    cy.get('input[name=name]').type('Sasquatch');

    const radios = cy.get('input[name=gender]');
    radios.should('have.length', 2);
    radios.first().click();

    cy.contains("Begin Your Adventuring Career").click();
    cy.contains("Welcome, Sasquatch");
    cy.contains("Next").click();
    cy.url().should('match', /main-hall\/hall/);
  });

  it('Can reroll stats', () => {
    // TODO: can we mock the RNG?
    //  (It's possible to stub Math.random, but that only takes effect within this test function
    //  and has no effect on Math.random() calls from other files.)
    cy.visit('/main-hall/register');

    // wait until the first set of attrs is populated in react state
    cy.waitUntil(() => cy.get("p[class=stat]")
      .then($els => $els.eq(0).text() !== '0'))

    let statsBefore, statsAfter;
    let statElements = cy.get('p[class=stat]');
    statElements.should('have.length', 3);
    statElements.then(($els) => {
      statsBefore = [
        $els.eq(0).text(),
        $els.eq(1).text(),
        $els.eq(2).text(),
      ]
      cy.log('stats before', [statsBefore]);
    });
    cy.contains('Reroll').click();
    statElements = cy.get('p[class=stat]');
    statElements.then(($els) => {
      statsAfter = [
        $els.eq(0).text(),
        $els.eq(1).text(),
        $els.eq(2).text(),
      ]
      cy.log('stats after', [statsAfter]);
      // Note: I don't know how to mock the RNG yet. This could fail in the
      // unlikely event that all 3 stat rolls are the same twice in a row.
      expect(statsAfter).to.not.deep.eq(statsBefore);
    })
  });

});

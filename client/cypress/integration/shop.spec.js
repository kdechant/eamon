import {onMainHallPage} from "../support/page_objects/mainHallPage";
import {onShopPage} from "../support/page_objects/shopPage";

describe('Main Hall - Weapons Shop', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/players.json*', {fixture: 'characters.json'});
    cy.intercept('GET', '**/players/*.json*', {fixture: 'character.json'});
    // cy.intercept('PUT', '**/players/*.json*', {fixture: 'character.json'});
    cy.visit('/main-hall/shop');
  })

  it('Can go to the shop', () => {
    cy.visit('/main-hall/hall');
    onMainHallPage.goToShop();
    cy.url().should('match', /main-hall\/shop$/);
  });

  it('Can buy standard weapons', () => {
    cy.visit('/main-hall/shop');
    onShopPage.goToBuyPage();
    onShopPage.expectGoldAmount(4200);
    cy.get('.weapons .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(8);
      cy.wrap(tiles).first().find('.btn-primary').click();
      cy.wrap(tiles).first().find('.message').should('be.visible').and('have.text', 'Bought!');
      cy.wait(2000);
      cy.wrap(tiles).first().find('.message').should('not.be.visible');
    });
    onShopPage.expectGoldAmount(4175);
    cy.get('.weapons .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(8);  // item didn't disappear
    });
  });

  it('Can buy non-standard weapons', () => {
    cy.visit('/main-hall/shop');
    onShopPage.goToBuyPage();
    onShopPage.expectGoldAmount(4200);
    cy.get('.weapons .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(8);
      const itemName = tiles.last().find('.artifact-name').text();
      const itemPrice = tiles.last().find('.artifact-price').text();
      cy.log(`Buying item ${itemName} for ${itemPrice}`);
      cy.wrap(tiles).last().find('.btn-primary').click();
      cy.wrap(tiles).last().find('.message').should('be.visible').and('have.text', 'Bought!');
      cy.wait(2000);
      cy.contains('.artifact-tile', itemName).should('not.exist');
      onShopPage.expectGoldAmount(4200 - itemPrice);
    });
    cy.get('.weapons .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(7);  // item disappeared
    });
  });

  it('Can buy armor', () => {
    cy.visit('/main-hall/shop');
    onShopPage.goToBuyPage();
    onShopPage.expectGoldAmount(4200);
    cy.get('.armor .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(5);
      cy.wrap(tiles).first().find('.btn-primary').click();
      cy.wrap(tiles).first().find('.message').should('be.visible').and('have.text', 'Bought!');
      cy.wait(2000);
      cy.wrap(tiles).first().find('.message').should('not.be.visible');
    });
    onShopPage.expectGoldAmount(4100);
    cy.get('.armor .artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(5);  // item didn't disappear
    });
  });

  it('Can sell items', () => {
    cy.visit('/main-hall/shop');
    onShopPage.goToSellPage();
    onShopPage.expectGoldAmount(4200);
    cy.get('.artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(3);
      const itemName = tiles.first().find('.artifact-name').text();
      const itemPrice = tiles.first().find('.artifact-price').text();
      cy.log(`Selling item ${itemName} for ${itemPrice}`);
      cy.wrap(tiles).first().find('.btn-primary').click();
      cy.wrap(tiles).first().find('.message').should('be.visible').and('have.text', 'Sold!');
      cy.wait(2000);
      cy.contains('.artifact-tile', itemName).should('not.exist');
      onShopPage.expectGoldAmount(4200 + +itemPrice);
    });
    cy.get('.artifact-tile').then(tiles => {
      expect(tiles.length).to.equal(2);  // item disappeared
    });
  });

});

describe('Busqueda productos', () => {
  it('busco cd de megadeth y agrego 3 unidades al carrito', () => {
    cy.visit('http://localhost:3000/')
    cy.get('#header-search').within(() => {
      cy.get('input').type('megadeth')
      cy.should('have.value', 'megadeth')
      cy.get('button').click()
    })
    const divProductos = cy.get('#productos')
    divProductos.children().should('have.length', 1)

    cy.get('#productos')
      .contains('.card', /cd megadeth/i)
      .within(() => {
        cy.get('.card-buttons').contains('a', 'Ver mas').click()
      })

      cy.url().should('include', '/productos/');
     cy.get('.card-body form').within(() => {
        cy.get('input').type(3).should('have.value', '03')
        cy.get('button').click() 
  })

  cy.get('.toast').should('be.visible').contains('Producto agregado')
}) })
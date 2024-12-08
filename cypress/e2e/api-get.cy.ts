describe('API GET Tests', () => {
  beforeEach(() => {
    // Mock de Network.getStatus para simular conexión
    cy.window().then((win: any) => {
      win.Network = {
        getStatus: () => Promise.resolve({ connected: true })
      };
    });

    // Interceptar todas las llamadas GET
    cy.intercept('GET', '**/users?username=*').as('loginRequest')
    cy.intercept('GET', 'http://localhost:3000/checklists').as('getChecklists')
    cy.intercept('GET', 'http://localhost:3000/vehiculos').as('getPatentes')

    cy.visit('/login')
    cy.get('input[name="username"]').type('jperez')
    cy.get('input[name="password"]').type('1234')
    cy.get('ion-button[type="submit"]').click()
    
    cy.wait('@loginRequest')
    cy.url().should('include', '/home')
  })

  it('debería realizar login', () => {
    cy.url().should('include', '/home')
  })

  it('debería obtener la lista de checklists desde la API', () => {
    cy.get('ion-card[routerLink="/historial"]').click()
    
    cy.wait('@getChecklists').then(interception => {
      if (interception.response) {
        cy.wrap(interception.response.statusCode).should('eq', 200)
        cy.wrap(interception.response.body).should('be.an', 'array')
        cy.wrap(interception.response.body).should('have.length.at.least', 1)
      }
    })
  })

  it('debería obtener la lista de patentes al entrar a checklist', () => {
    cy.get('ion-card[routerLink="/checklist"]').click()
    
    cy.wait('@getPatentes').then(interception => {
      if (interception.response) {
        cy.wrap(interception.response.statusCode).should('eq', 200)
        cy.wrap(interception.response.body).should('be.an', 'array')
        cy.wrap(interception.response.body).should('have.length.at.least', 1)
        cy.wrap(interception.response.body[0]).should('have.property', 'patente')
      }
    })
  })
}) 
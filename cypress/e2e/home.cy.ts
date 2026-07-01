describe("Home page", () => {
  it("loads and displays the heading", () => {
    cy.visit("/");
    cy.contains("News App").should("be.visible");
  });
});

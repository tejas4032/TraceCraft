const ProductStorage = artifacts.require("ProductStorage");

contract("ProductStorage", () => {
  it("should store and retrieve a product with all fields", async () => {
    const instance = await ProductStorage.deployed();

    // Add a product
    await instance.addProduct(
      1,
      "Laptop",
      500,
      "ABC Corp",
      "Leading Electronics Manufacturer",
      "77.5946",
      "12.9716",
      "Electronics"
    );

    // Retrieve the product
    const product = await instance.getProduct(1);

    assert.equal(product[0].toString(), "1", "Product ID should be 1");
    assert.equal(product[1], "Laptop", "Product name should be Laptop");
    assert.equal(product[2].toString(), "500", "Product price should be 500");
    assert.equal(product[3], "ABC Corp", "Manufacturer name should be ABC Corp");
    assert.equal(product[4], "Leading Electronics Manufacturer", "Manufacturer details should match");
    assert.equal(product[5], "77.5946", "Longitude should be 77.5946");
    assert.equal(product[6], "12.9716", "Latitude should be 12.9716");
    assert.equal(product[7], "Electronics", "Category should be Electronics");
  });
});

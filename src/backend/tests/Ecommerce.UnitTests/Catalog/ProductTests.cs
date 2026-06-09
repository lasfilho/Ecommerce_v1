using Ecommerce.Modules.Catalog.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.UnitTests.Catalog;

public sealed class ProductTests
{
    private static Product CreateProduct(int stock = 10) =>
        new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Camiseta",
            "camiseta",
            "SKU-001",
            "Descrição curta",
            null,
            99.90m,
            79.90m,
            stock,
            DateTime.UtcNow);

    [Fact]
    public void EffectivePrice_ShouldUsePromotionalPrice_WhenPresent()
    {
        var product = CreateProduct();

        product.EffectivePrice.Should().Be(79.90m);
    }

    [Fact]
    public void HasStock_ShouldReturnTrue_WhenQuantityIsAvailable()
    {
        var product = CreateProduct(stock: 5);

        product.HasStock(3).Should().BeTrue();
        product.HasStock(5).Should().BeTrue();
        product.HasStock(6).Should().BeFalse();
    }

    [Fact]
    public void DecreaseStock_ShouldReduceQuantity_WhenStockIsSufficient()
    {
        var product = CreateProduct(stock: 4);
        var updatedAt = DateTime.UtcNow;

        product.DecreaseStock(2, updatedAt);

        product.StockQuantity.Should().Be(2);
        product.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void DecreaseStock_ShouldThrow_WhenStockIsInsufficient()
    {
        var product = CreateProduct(stock: 1);

        var act = () => product.DecreaseStock(2, DateTime.UtcNow);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Estoque*");
    }

    [Fact]
    public void SetActive_ShouldToggleVisibility()
    {
        var product = CreateProduct();
        var updatedAt = DateTime.UtcNow;

        product.SetActive(false, updatedAt);

        product.IsActive.Should().BeFalse();
        product.UpdatedAt.Should().Be(updatedAt);
    }
}

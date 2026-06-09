using Ecommerce.Modules.Catalog.Application.Common;
using FluentAssertions;

namespace Ecommerce.UnitTests.Common;

public sealed class SlugNormalizerTests
{
    [Theory]
    [InlineData("Camiseta Básica", "camiseta-basica")]
    [InlineData("  Tênis Esportivo  ", "tenis-esportivo")]
    [InlineData("Produto #1!", "produto-1")]
    [InlineData("Café Premium", "cafe-premium")]
    public void Normalize_ShouldReturnUrlFriendlySlug(string input, string expected)
    {
        SlugNormalizer.Normalize(input).Should().Be(expected);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Normalize_ShouldReturnEmpty_WhenInputIsBlank(string? input)
    {
        SlugNormalizer.Normalize(input!).Should().BeEmpty();
    }
}

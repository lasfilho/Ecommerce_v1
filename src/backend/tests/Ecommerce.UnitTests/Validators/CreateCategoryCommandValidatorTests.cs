using Ecommerce.Modules.Catalog.Application.Categories.CreateCategory;
using FluentAssertions;

namespace Ecommerce.UnitTests.Validators;

public sealed class CreateCategoryCommandValidatorTests
{
    private readonly CreateCategoryCommandValidator _validator = new();

    [Fact]
    public void ShouldPass_ForValidCommand()
    {
        var command = new CreateCategoryCommand("Roupas", null, "Categoria de roupas", null);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public void ShouldFail_WhenNameIsEmpty(string name)
    {
        var command = new CreateCategoryCommand(name, null, null, null);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateCategoryCommand.Name));
    }
}

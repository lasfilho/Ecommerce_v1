using Ecommerce.Shared.Application;
using FluentAssertions;

namespace Ecommerce.UnitTests.Shared;

public sealed class ResultTests
{
    [Fact]
    public void Success_ShouldExposeValue()
    {
        var result = Result.Success("ok");

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("ok");
    }

    [Fact]
    public void Failure_ShouldExposeError()
    {
        var error = Error.Validation("Test.Code", "Mensagem");

        var result = Result.Failure<string>(error);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Fact]
    public void Value_ShouldThrow_WhenResultIsFailure()
    {
        var result = Result.Failure<string>(Error.NotFound("Test", "Não encontrado"));

        var act = () => result.Value;

        act.Should().Throw<InvalidOperationException>();
    }
}

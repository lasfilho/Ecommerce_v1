using Ecommerce.Modules.Identity.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.UnitTests.Identity;

public sealed class UserTests
{
    [Fact]
    public void SetActive_ShouldUpdateStatusAndTimestamp()
    {
        var user = new User(
            Guid.NewGuid(),
            "user@test.com",
            "hash",
            "João",
            "Silva",
            DateTime.UtcNow);

        var updatedAt = DateTime.UtcNow.AddMinutes(1);
        user.SetActive(false, updatedAt);

        user.IsActive.Should().BeFalse();
        user.UpdatedAt.Should().Be(updatedAt);
    }
}

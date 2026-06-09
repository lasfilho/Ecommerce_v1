using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Domain.Enums;
using FluentAssertions;

namespace Ecommerce.UnitTests.Orders;

public sealed class OrderStatusTransitionsTests
{
    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Paid, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Shipped, false)]
    [InlineData(OrderStatus.Paid, OrderStatus.Processing, true)]
    [InlineData(OrderStatus.Processing, OrderStatus.Shipped, true)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Delivered, true)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Cancelled, false)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Pending, false)]
    public void IsAllowed_ShouldRespectWorkflow(
        OrderStatus current,
        OrderStatus next,
        bool expected)
    {
        OrderStatusTransitions.IsAllowed(current, next).Should().Be(expected);
    }
}

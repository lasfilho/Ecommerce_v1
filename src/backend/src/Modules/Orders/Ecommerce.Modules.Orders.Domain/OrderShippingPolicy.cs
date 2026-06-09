namespace Ecommerce.Modules.Orders.Domain;

/// <summary>Política de frete calculada no backend — não confia no frontend.</summary>
public static class OrderShippingPolicy
{
    private const decimal FreeShippingThreshold = 200m;
    private const decimal StandardShippingCost = 19.90m;

    public static decimal Calculate(decimal subtotal) =>
        subtotal >= FreeShippingThreshold ? 0m : StandardShippingCost;
}

namespace Ecommerce.Api.Contracts.Cart;

public sealed record AddCartItemRequest(int Quantity);

public sealed record UpdateCartItemQuantityRequest(int Quantity);

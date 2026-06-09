namespace Ecommerce.Shared.Application;

/// <summary>Marca um request MediatR como query (operação de leitura).</summary>
public interface IQuery<TResponse> : MediatR.IRequest<TResponse>;

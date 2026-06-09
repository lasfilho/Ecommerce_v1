namespace Ecommerce.Shared.Application;

/// <summary>Marca um request MediatR como command (operação de escrita).</summary>
public interface ICommand : MediatR.IRequest<Result>;

/// <summary>Command que retorna um valor tipado encapsulado em Result.</summary>
public interface ICommand<TResponse> : MediatR.IRequest<Result<TResponse>>;

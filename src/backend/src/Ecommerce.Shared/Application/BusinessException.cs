namespace Ecommerce.Shared.Application;

/// <summary>Exceção de negócio tratada pelo middleware global da API.</summary>
public class BusinessException : Exception
{
    public string Code { get; }
    public int StatusCode { get; }

    public BusinessException(string code, string message, int statusCode = 400)
        : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }
}

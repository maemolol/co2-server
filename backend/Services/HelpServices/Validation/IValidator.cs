namespace Validation;

public interface IValidator<T>
{
    public Dictionary<string, string> Validate(T obj);
}
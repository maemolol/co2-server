using Validation;
using Dtos;

namespace Validation;

public class UserLoginValidation : IValidator<UserLoginDto>
{
    public Dictionary<string, string> Validate(UserLoginDto user)
    {
        var errors = new Dictionary<string, string>();

        if(string.IsNullOrWhiteSpace(user.username))
            errors["username"] = "Username is required.";

        if (string.IsNullOrWhiteSpace(user.password))
            errors["password"] = "Password is required.";

        return errors;
    }
}
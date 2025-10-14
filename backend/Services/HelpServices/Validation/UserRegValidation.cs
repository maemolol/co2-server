using System.Text.RegularExpressions;
using System.Collections.Generic;
using Validation;
using Dtos;

namespace Validation;

public class UserRegValidation : IValidator<UserRegisterDto>
{
    public Dictionary<string, string> Validate(UserRegisterDto user)
    {
        var errors = new Dictionary<string, string>();

        if(string.IsNullOrWhiteSpace(user.username))
            errors["username"] = "Username is required.";
        else
        {
            if(user.username.Length < 3 || user.username.Length > 20)
                errors["username"] = "Username must be between 3 and 20 characters.";
            if(!Regex.IsMatch(user.username, @"^[a-zA-Z0-9_]+$"))
                errors["username"] = "Username can only contain letters, numbers, and underscores.";
        }

        if (string.IsNullOrWhiteSpace(user.password))
            errors["password"] = "Password is required.";
        else
        {
            if (user.password.Length < 8)
                errors["password"] = "Password must be at least 8 characters long.";
            if (!Regex.IsMatch(user.password, @"[A-Z]"))
                errors["password"] = "Password must contain at least one uppercase letter.";
            if (!Regex.IsMatch(user.password, @"[a-z]"))
                errors["password"] = "Password must contain at least one lowercase letter.";
            if (!Regex.IsMatch(user.password, @"[0-9]"))
                errors["password"] = "Password must contain at least one digit.";
            if (!Regex.IsMatch(user.password, @"[\W_]"))
                errors["password"] = "Password must contain at least one special character.";
        }


        return errors;
    }
}
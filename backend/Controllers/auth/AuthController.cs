using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Validation;
using Config;
using Models;
using Dtos;
using DevOne.Security.Cryptography.BCrypt;

namespace Controllers;

[ApiController]
[Route("/")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        this.context = context;
        _jwt = new JwtService(config);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto user)
    {
        var validator = new UserRegValidation();
        var errors = validator.Validate(user);

        if (errors.Any())
            return BadRequest(new { errors });

        try
        {
            if (await context.Users.AnyAsync(u => u.username == user.username))
                return BadRequest("Username is already registered.");

            var newUser = new Users
            {
                user_uid = Guid.NewGuid(),
                username = user.username,
                password_hash = BCrypt.Net.BCrypt.HashPassword(user.password)
            };

            using var transaction = await context.Database.BeginTransactionAsync();
            await context.Users.AddAsync(newUser);
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok("User registered successfully");
        }
        catch (Exception ex)
        {
            return Problem("Registration error: " + ex.Message);
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto user)
    {
        var validator = new UserLoginValidation();

        
    }
}
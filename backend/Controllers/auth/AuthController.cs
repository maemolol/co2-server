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
    private readonly AppDbContext _context;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
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
            if (await _context.Users.AnyAsync(u => u.username == user.username))
                return BadRequest("Username is already registered.");

            var newUser = new Users
            {
                user_id = Guid.NewGuid(),
                username = user.username,
                password_hash = BCrypt.Net.BCrypt.HashPassword(user.password)
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var message = $"User {newUser.user_id} (username: {newUser.username}) has been registered.";
            Console.WriteLine(message);

            return Ok(new { message, data = newUser });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Registration error: " + ex.Message);
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto request)
    {
        var validator = new UserLoginValidation();
        var errors = validator.Validate(request);

        if (errors.Any())
            return BadRequest(new { errors });

        try
        {
            var username = request.username;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

            if (user == null)
            {
                Console.WriteLine("User not found");
                return BadRequest("Incorrect username or password");
            }

            bool passCorrect = BCrypt.Net.BCrypt.Verify(request.password, user.password_hash);

            if (!passCorrect)
            {
                Console.WriteLine("User password incorrect");
                return BadRequest("Incorrect username or password");
            }

            var message = $"User {user.username} logged in successfully.";
            Console.WriteLine(message);

            return Ok(new {message, data = user});
        }
        catch (Exception ex)
        {
            return Problem("Login error: " + ex.Message);
        }

        
    }
}
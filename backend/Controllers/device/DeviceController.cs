using Microsoft.AspNetCore.Mvc;
using Dtos;

namespace Controllers;

[ApiController]
[Route("/devices")]
public class DeviceController : ControllerBase
{
    private readonly AppDbContext _context;

    public DeviceController(AppDbContext context) => _context = context;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DeviceRegisterDto request)
    {
        if(request == null) return BadRequest(new { error = "Body is required."});
        
        try
        {
            return Ok();
        } catch (Exception ex)
        {
            return BadRequest ( new { error = ex });
        }
    }
}
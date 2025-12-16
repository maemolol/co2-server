using Microsoft.AspNetCore.Mvc;
using Dtos;
using Models;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace Controllers;

[ApiController]
[Route("/devices")]
[Produces("application/json")]
public class DeviceController : ControllerBase
{
    private readonly AppDbContext _context;

    public DeviceController(AppDbContext context) => _context = context;

    private static string NormaliseMac(string address)
    {
        var orig_string = new string(address.Where(c => Uri.IsHexDigit(c)).ToArray()).ToUpperInvariant();
        if(orig_string.Length != 12) return address.Trim();
        return string.Create(17, orig_string, (span, src) =>
        {
            span[0] = src[0]; span[1] = src[1]; span[2] = ':';
            span[3] = src[2]; span[4] = src[3]; span[5] = ':';
            span[6] = src[4]; span[7] = src[5]; span[8] = ':';
            span[9] = src[6]; span[10] = src[7]; span[11] = ':';
            span[12] = src[8]; span[13] = src[9]; span[14] = ':';
            span[15] = src[10]; span[16] = src[11];
        });
    }

    private static bool IsValidMac(string mac) =>
        Regex.IsMatch(mac, "^[0-9A-F]{2}(:[0-9A-F]{2}){5}$");

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DeviceRegisterDto request)
    {
        if(request == null) return BadRequest(new { error = "Body is required."});
        if(string.IsNullOrWhiteSpace(request.device_mac)) return BadRequest( new { error = "Sensor MAC address required." });
        
        var mac = NormaliseMac(request.device_mac);
        if(!IsValidMac(mac)) return BadRequest(new { error = "Invalid MAC address format. Please change to AA:BB:CC:DD:EE:FF."});

        var name = (request.name ?? "untitled").Trim();
        var location = (request.location ?? "Unknown location").Trim();

        try
        {
            if(await _context.Devices.AnyAsync(d => d.device_mac == mac))
                return Conflict(new { error = "Device with this MAC address is already registered."});

            if (!string.IsNullOrEmpty(name))
            {
                var isNameReal = await _context.Devices.AnyAsync(d => d.user_id == request.user_id && d.name != null && d.name.ToLower() == name.ToLower());
                
                if(isNameReal)
                    return Conflict(new { error = "Device with such name is already associated with user"});
            }

            var device = new Devices
            {
                device_mac = mac,
                name = name,
                location = location,
                registered_at = DateTime.UtcNow,
                user_id = request.user_id
            };

            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            var message = $"Device '{device.device_mac}' registered for user {device.user_id}.";
            return Ok( new { message, data = DeviceOutDto.FromEntity(device) });
        } catch (Exception ex)
        {
            Console.WriteLine($"Failed to register device: {ex.Message}.");
            return StatusCode(500, new { error = "Failed to register device." });
        }
    }

    [HttpGet("user/{uId:guid}")]
    public async Task<IActionResult> LookupUser(Guid uId)
    {
        try
        {
            var devices = await _context.Devices
                .AsNoTracking()
                .Where(d => d.user_id == uId)
                .OrderByDescending(d => d.registered_at)
                .ToListAsync();
            
            var message = $"Found {devices.Count} devices for user {uId}.";
            Console.WriteLine(message);

            var data = devices.Select(d => DeviceOutDto.FromEntity(d)).ToList();
            return Ok(new{message, data});
        } catch (Exception ex)
        {
            Console.WriteLine($"Failed to get device list: {ex.Message}.");
            return StatusCode(500, new { error = "Failed to get device list." });
        }
    }

    [HttpGet("id/{dMac:string}")]
    public async Task<IActionResult> LookupDevice(string dMac)
    {
        if(string.IsNullOrEmpty(dMac))
            return BadRequest(new {error = "No MAC address specified. Please specify a MAC address."});
        
        var mac = NormaliseMac(dMac);
        if(!IsValidMac(mac)) return BadRequest(new { error = "Invalid MAC address format. Please change to AA:BB:CC:DD:EE:FF."});

        try
        {
            var device = await _context.Devices.AsNoTracking().FirstOrDefaultAsync(d => d.device_mac == mac);
            if(device == null)
                return NotFound(new {error = "Device not found. Please register said device."});
            
            var message = $"Device {device.device_mac} found.";
            Console.WriteLine(message);

            return Ok(new{message, data = DeviceOutDto.FromEntity(device)});
        } catch (Exception ex)
        {
            Console.WriteLine($"Failed to get device: {ex.Message}.");
            return StatusCode(500, new { error = "Failed to get device." });
        }
    }
}
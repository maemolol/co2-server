using Models;
using Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controllers;

[ApiController]
[Route("/")]
[Produces("application/json")]
public class MeasurementController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly string _authKey;

    public MeasurementController(AppDbContext context)
    {
        _context = context;
        _authKey = Environment.GetEnvironmentVariable("API_AUTH_KEY");
    }

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

    private bool KeyAutorised(Microsoft.AspNetCore.Http.HttpRequest request)
    {
        if(!string.IsNullOrEmpty(_authKey) && request.Headers.TryGetValue("X-Api-Key", out var key) && key.ToString() == _authKey)
        {
            return true;
        }
        return false;
    }

    [HttpPost("measure")]
    public async Task<IActionResult> GetMeasurements([FromBody] MeasurementInDto request)
    {
        var errors = new Dictionary<string, string>();

        if(request == null) return BadRequest(new { error = "Body is required."});
        if(string.IsNullOrEmpty(request.device_mac)) errors["deviceMac"] = "Device MAC required.";
        //if(request.user_id == Guid.Empty) errors["userId"] = "User ID is required.";
        // if(request.device_users_id == Guid.Empty) errors["devuserId"] = "Device/user ID required.";
        if(request.co2 <= 0 || request.co2 > 10000) errors["co2"] = "Invalid CO2 value.";
        if(errors.Count > 0) return BadRequest(new {errors});

        try
        {
            var mac = NormaliseMac(request.device_mac);

            var link = await _context.DeviceUsers.FirstOrDefaultAsync(du => du.device_mac == mac );

            if(link == null)
            {
                // if(!KeyAutorised(Request)) return Unauthorized(new {error = "Device not enrolled with this user."});

                return Unauthorized(new {error = "Device not enrolled with this user."});

                /* link = new DeviceUsers
                {
                  device_mac = mac,
                  user_id = request.user_id,
                  hash = null,
                };
                _context.DeviceUsers.Add(link);
                await _context.SaveChangesAsync(); */
            }

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.device_mac == mac);
            if(device == null)
            {
                device = new Devices
                {
                    device_mac = mac,
                    name = "Auto-registered",
                    location = "Unknown",
                    registered_at = DateTime.UtcNow,
                    user_id = link.user_id
                };
                _context.Devices.Add(device);
                await _context.SaveChangesAsync();
            }

            if(!KeyAutorised(Request))
            {
                if(!Request.Headers.TryGetValue("X-Api-Key", out var key) || string.IsNullOrEmpty(key)) return Unauthorized(new {error = "API key required."});
                if(string.IsNullOrEmpty(link.hash) || !BCrypt.Net.BCrypt.Verify(key.ToString(), link.hash)) return Unauthorized(new {error = "Invalid device hash."});
            }

            var tStamp = (request.timestamp ?? DateTime.UtcNow).ToUniversalTime();

            var entry = new Measurement
            {
                measurement_id = Guid.NewGuid(),
                device_mac = mac,
                user_id = link.user_id,
                device_users_id = link.id,
                co2 = request.co2,
                temperature = request.temperature,
                humidity = request.humidity,
                timestamp = tStamp
            };

            _context.Measurements.Add(entry);
            await _context.SaveChangesAsync();

            var message = $"Got measurement: device {mac}, device-user ID {link.id}, CO2 {request.co2} at {tStamp:o}";
            Console.WriteLine(message);

            return Ok(new {message, data = MeasurementOutDto.FromEntity(entry)});
        } catch (Exception ex)
        {
            return BadRequest(new {error = ex});
        }
        
    }

    [HttpGet("measurements/{device_mac}")]
    public async Task<IActionResult> GetByMac(string device_mac, [FromQuery] int limit = 25, [FromQuery] int offset = 0)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);
            var mac = NormaliseMac(device_mac);

            var query = _context.Measurements
                .AsNoTracking()
                .Where(m => m.device_mac == mac)
                .OrderByDescending(m => m.timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            return Ok(new
            {
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDto.FromEntity)
            });
        } catch(Exception ex)
        {
            return BadRequest(new {error = ex.Message});
        }
    }

    [HttpGet("measurements/recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 25, [FromQuery] int offset = 0)
    {
        try
        {
            limit = Math.Clamp(limit, 1, 1000);
            offset = Math.Max(0, offset);

            var query = _context.Measurements
                .AsNoTracking()
                .OrderByDescending(m => m.timestamp);

            var total = await query.CountAsync();
            var items = await query.Skip(offset).Take(limit).ToListAsync();

            return Ok(new
            {
                total,
                limit,
                offset,
                data = items.Select(MeasurementOutDto.FromEntity)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to fetch recent: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch measurements." });
        }
    }

    [HttpGet("measurements/{deviceId}/latest")]
    public async Task<IActionResult> GetLatestByDevice(string device_mac)
    {
        try
        {
            var mac = NormaliseMac(device_mac);

            var item = await _context.Measurements
                .AsNoTracking()
                .Where(m => m.device_mac == mac)
                .OrderByDescending(m => m.timestamp)
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound(new { error = "No measurements yet." });

            var message = $"> Latest measurement fetched: device={mac}, co2={item.co2}, ts={item.timestamp:o}";
            Console.WriteLine(message);

            return Ok(new { message, data = MeasurementOutDto.FromEntity(item) });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to get latest measurement: {ex.Message}");
            return StatusCode(500, new { error = "Failed to get latest measurement." });
        }
    }
}
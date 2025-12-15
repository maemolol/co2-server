namespace Dtos;

public class DeviceRegisterDto
{
    public Guid device_id { get; set; }
    public string? name { get; set; }
    public string? location { get; set; }
    public string? registered_at { get; set; }
}
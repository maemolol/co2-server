using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Models;

public class Users {
	[Key]
	public Guid user_uid { get; set; } = Guid.NewGuid();
	public string? username { get; set; }
	public string? password_hash { get; set; }
}

public class Devices
{
	[Key]
	public Guid device_id { get; set; } = Guid.NewGuid();
	public string? device_mac { get; set; }
	public string? name { get; set; }
	public string? location { get; set; }
	public DateTime registered_at { get; set; }

	[ForeignKey(nameof(Users))]
	public Guid user_id { get; set; }
}

public class Measurement
{
	[Key]
	public Guid measurement_id { get; set; } = Guid.NewGuid();

	[ForeignKey(nameof(Devices))]
	public string? device_mac {get; set;}

	[ForeignKey(nameof(Users))]
	public Guid user_id {get; set;}

	[ForeignKey(nameof(DeviceUsers))]
	public Guid device_users_id { get; set; }

	public DateTime timestamp { get; set; }
	public float? temperature { get; set; }
	public double co2 { get; set; }
	public float? humidity { get; set; }
}

public class DeviceUsers
{
	[Key]
    public Guid id { get; set; } = Guid.NewGuid();

	[ForeignKey(nameof(Devices))]
	public string device_mac { get; set; } = default!;

	[ForeignKey(nameof(Users))]
	public Guid user_id { get; set; }

	public string? hash {get; set;}
}


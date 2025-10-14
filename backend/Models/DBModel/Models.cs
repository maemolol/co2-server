namespace Models;

public class Users {
	public Guid user_uid { get; set; }
	public string? username { get; set; }
	public string? password_hash { get; set; }
}

public class Devices
{
	public Guid device_id { get; set; }
	public string? name { get; set; }
	public string? location { get; set; }
	public DateTime? registered_at { get; set; }
	public Guid? user_id { get; set; }
}

public class Measurement
{
	public Guid measurement_id { get; set; }
	public Guid? device_id { get; set; }
	public DateTime? timestamp { get; set; }
	public float? temperature { get; set; }
	public float? co2 { get; set; }
	public float? humidity { get; set; }
}


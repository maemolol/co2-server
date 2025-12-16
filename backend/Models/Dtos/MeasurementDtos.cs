namespace Dtos;

public class MeasurementInDto
{
    public string device_mac {get; set;} = default!;
    public Guid user_id {get; set;}
    public Guid device_users_id {get; set;}
    public double co2 {get; set;}
    public float temperature {get; set;}
    public float humidity {get; set;}
    public DateTime? timestamp {get; set;}
}
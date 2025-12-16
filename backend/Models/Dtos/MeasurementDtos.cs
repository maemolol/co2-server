using Models;
namespace Dtos;

public class MeasurementInDto
{
    public string device_mac {get; set;} = default!;
    public Guid user_id {get; set;}
    public double co2 {get; set;}
    public float temperature {get; set;}
    public float humidity {get; set;}
    public DateTime? timestamp {get; set;}
}

public class MeasurementOutDto
{
    public Guid measurement_id {get; set;}
    public string device_mac {get; set;} = default!;
    public Guid user_id {get; set;}
    public double co2 {get; set;}
    public float? temperature {get; set;}
    public float? humidity {get; set;}
    public DateTime? timestamp {get; set;}

    public static MeasurementOutDto FromEntity(Measurement m) => new()
    {
      measurement_id = m.measurement_id,
      device_mac = m.device_mac,
      user_id = m.user_id,
      co2 = m.co2,
      temperature = m.temperature,
      humidity = m.humidity,
      timestamp = m.timestamp
    };
}
using Cyberpunk;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CyberpunkUi", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("CyberpunkUi");

app.MapHub<GameHub>("/gameHub");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast");

app.MapPost("/api/wordle", async (WordleRequest request, IHubContext<GameHub> hubContext) =>
    {
        var word = request.Word?.Trim();

        if (string.IsNullOrWhiteSpace(word))
        {
            return Results.BadRequest(new { error = "Word is required." });
        }

        await hubContext.Clients.All.SendAsync("Wordle", word);

        return Results.Ok(new { eventName = "Wordle", word });
    })
    .WithName("TriggerWordle");

app.MapPost("/api/message", async (MessageRequest request, IHubContext<GameHub> hubContext) =>
    {
        var user = request.User?.Trim();
        var message = request.Message?.Trim();

        if (string.IsNullOrWhiteSpace(user))
        {
            return Results.BadRequest(new { error = "User is required." });
        }

        if (string.IsNullOrWhiteSpace(message))
        {
            return Results.BadRequest(new { error = "Message is required." });
        }

        await hubContext.Clients.All.SendAsync("Message", new
        {
            user,
            message
        });

        return Results.Ok(new { eventName = "Message", user, message });
    })
    .WithName("TriggerMessage");

app.Run();

record WordleRequest(string? Word);

record MessageRequest(string? User, string? Message);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

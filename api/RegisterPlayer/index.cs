using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Azure.Data.Tables;

public static class RegisterPlayer
{
    [FunctionName("RegisterPlayer")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "register")] HttpRequest req)
    {
        var body = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonSerializer.Deserialize<JsonElement>(body);

        string username = data.GetProperty("username").GetString();
        if (string.IsNullOrWhiteSpace(username))
            return new BadRequestObjectResult(new { error = "Missing username" });

        string token = Guid.NewGuid().ToString("N");

        var tableClient = TableStorageHelper.GetTableClient();
        await tableClient.CreateIfNotExistsAsync();

        var entity = new TableEntity("player", username)
        {
            { "Token", token },
            { "Score", 0 }
        };

        await tableClient.UpsertEntityAsync(entity);

        return new OkObjectResult(new { token });
    }
}

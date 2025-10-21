using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Azure.Data.Tables;

public static class SubmitAnswer
{
    [FunctionName("SubmitAnswer")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "submit")] HttpRequest req)
    {
        var body = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonSerializer.Deserialize<JsonElement>(body);

        string token = data.GetProperty("token").GetString();
        string answer = data.GetProperty("answer").GetString();

        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(answer))
            return new BadRequestObjectResult(new { error = "Missing token or answer" });

        var tableClient = TableStorageHelper.GetTableClient();
        await tableClient.CreateIfNotExistsAsync();

        // Lookup user by token
        await foreach (var entity in tableClient.QueryAsync<TableEntity>(x => x.GetString("Token") == token))
        {
            int currentScore = entity.GetInt32("Score") ?? 0;
            int delta = answer == "42" ? 1 : 0;  // simple logic
            entity["Score"] = currentScore + delta;

            await tableClient.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace);
            return new OkObjectResult(new { success = true, newScore = entity["Score"] });
        }

        return new NotFoundObjectResult(new { error = "Token not found" });
    }
}

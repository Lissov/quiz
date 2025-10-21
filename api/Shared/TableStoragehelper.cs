using System;
using Azure.Data.Tables;

public static class TableStorageHelper
{
    public static TableClient GetTableClient()
    {
        string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
        var serviceClient = new TableServiceClient(connectionString);
        return serviceClient.GetTableClient("Players");
    }
}

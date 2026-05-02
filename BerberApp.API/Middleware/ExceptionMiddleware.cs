using System.Net;
using BerberApp.API.Models;

namespace BerberApp.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger,
            IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (UnauthorizedAccessException ex)
            {
                await WriteErrorResponse(context, HttpStatusCode.Unauthorized, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Beklenmeyen bir hata olustu.");

                var message = _environment.IsDevelopment()
                    ? ex.Message
                    : "Beklenmeyen bir hata olustu.";

                await WriteErrorResponse(context, HttpStatusCode.InternalServerError, message);
            }
        }

        private static async Task WriteErrorResponse(HttpContext context, HttpStatusCode statusCode, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse<object>.Fail(message);

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

using Hmss.Api.Gateways.Interfaces;
using System.Net;
using System.Net.Mail;

namespace Hmss.Api.Gateways.Implementations;

public class EmailGateway : IEmailGateway
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailGateway> _logger;

    public EmailGateway(IConfiguration config, ILogger<EmailGateway> logger)
    {
        _config = config;
        _logger = logger;
    }

    public void SendAsync(EmailMessage message)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var host = _config["Email:SmtpHost"] ?? "smtp.gmail.com";
                var port = int.Parse(_config["Email:SmtpPort"] ?? "587");
                var from = _config["Email:FromAddress"] ?? "noreply@hmss.local";
                var username = _config["Email:Username"] ?? string.Empty;
                var password = _config["Email:Password"] ?? string.Empty;

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(username, password)
                };
                var mail = new MailMessage(from, message.To, message.Subject, message.Body);
                await client.SendMailAsync(mail);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Email send failed to {To}: {Msg}", message.To, ex.Message);
            }
        });
    }
}

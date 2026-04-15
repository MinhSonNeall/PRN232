namespace Hmss.Api.Gateways.Interfaces;
public record EmailMessage(string To, string Subject, string Body);
public interface IEmailGateway
{
    void SendAsync(EmailMessage message); // fire-and-forget, logs failures
}

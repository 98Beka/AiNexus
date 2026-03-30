namespace AiNexus.Helpers.ApplicationExceptions;

public class EmailException : Exception
{
    public EmailException() : base() { }

    public EmailException(string message) : base(message) { }

    public EmailException(string message, Exception? innerException) : base(message, innerException) { }

    public EmailException(string field, string message)
        : base($"{field}: - {message}") { }

}

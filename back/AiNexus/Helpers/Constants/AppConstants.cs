namespace Library.Helpers.Constants
{
    public class AppConstants
    {
        public const int MaxFailedAccessAttempts = 3;
        public const int LockoutTimeSpan_Minutes = 5;
        public const int PasswordChangePeriodDays = 90;
        public const string CorrHeader = "X-Correlation-ID";
    }
}

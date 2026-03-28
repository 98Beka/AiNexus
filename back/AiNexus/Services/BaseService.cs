namespace Library.Services
{
    public class BaseService(IHttpContextAccessor httpContextAccessor)
    {
        protected string getCurrentAccountId() => (string)httpContextAccessor.HttpContext.Items["AccountId"];
        protected List<string> getCurrentAccountRoles() => (List<string>)httpContextAccessor.HttpContext.Items["AccountRoles"];
    }
}

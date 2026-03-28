using Library.Enums.Accounts;
using Library.Helpers.ApplicationExceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Library.Helpers.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly List<Role> _roles = new List<Role>();

        public AuthorizeAttribute()
        {
        }
        public AuthorizeAttribute(params Role[] roles)
        {
            _roles = roles.ToList();
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // skip authorization if action is decorated with [AllowAnonymous] attribute
            var allowAnonymous = context.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any();
            if (allowAnonymous)
                return;

            // authorization
            var accountId = (string)context.HttpContext.Items["AccountId"];
            if (accountId == null)
            {
                context.Result = new JsonResult(new { message = "Unauthorized" }) { StatusCode = StatusCodes.Status401Unauthorized };
            }
            else if (_roles.Count > 0)
            {
                var serviceProvider = context.HttpContext.RequestServices;
                var rolesStringList = (List<string>)context.HttpContext.Items["AccountRoles"];
                var userRoles = rolesStringList
                    .Select(role => (Role)Enum.Parse(typeof(Role), role.Trim()))
                    .ToList();

                if (userRoles == null || !userRoles.Any(ur => ur == Role.admin || _roles.Contains(ur)))
                {
                    throw new ForbiddenException("Доступ запрещен :(");
                }
            }
        }
    }
}

using Library.Models;
using Library.Models.Accounts;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Library.Helpers.DbContexts;

public class AppPostgreSQLDbContext : IdentityDbContext<Account, Role, string>
{
    public DbSet<AccountSettings> AccountSettings { get; set; }

    public DbSet<Session> Sessions { get; set; }

    public DbSet<Applicant> Applicants { get; set; }

    public AppPostgreSQLDbContext(DbContextOptions options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
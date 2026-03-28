using Library.Models.Accounts;

namespace Library.Models
{
    public class BaseEntity
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string CreatedById { get; set; }
        public Account CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedById { get; set; }
        public Account? UpdatedBy { get; set; }
    }
}

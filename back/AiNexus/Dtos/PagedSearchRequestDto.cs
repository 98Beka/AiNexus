using Library.Helpers.Paginations;


namespace Library.Dtos
{
    public class PagedSearchRequestDto<T> where T : class
    {
        public PaginationParameters Pagination { get; set; }
        public T Filter { get; set; }
    }
}

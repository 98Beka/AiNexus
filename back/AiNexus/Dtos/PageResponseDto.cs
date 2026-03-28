namespace Library.Dtos
{
    public class PageResponseDto<T>
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public long TotalPages { get; set; }
        public long TotalCount { get; set; }
        public List<T> Content { get; set; }
    }
}

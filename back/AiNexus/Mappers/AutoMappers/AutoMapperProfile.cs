using AutoMapper;
using Library.Dtos.Accounts;
using Library.Models.Accounts;



namespace Library.Mappers.AutoMappers;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<AccountSettings, AccountSettingsDto>();

        CreateMap<Account, AuthenticateResponse>()
            .ForMember(dest => dest.Pin, opt => opt.MapFrom(src => src.Email));

        CreateMap<Account, AccountDto>()
            .ForMember(dest => dest.Pin, opt => opt.MapFrom(src => src.Email));

        CreateMap<Account, MyAccountInfo>()
            .ForMember(dest => dest.Pin, opt => opt.MapFrom(src => src.Email));


        CreateMap<UpdateAccountRequest, Account>().ReverseMap();
    }
}
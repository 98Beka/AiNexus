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
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

        CreateMap<Account, AccountDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

        CreateMap<Account, MyAccountInfo>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));


        CreateMap<UpdateAccountRequest, Account>().ReverseMap();
    }
}
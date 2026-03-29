using AutoMapper;
using Library.Dtos.Accounts;
using Library.Models;
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

        CreateMap<Applicant, Dtos.Applicants.ApplicantDto>()
            .ForMember(dest => dest.TemporaryToken, opt => opt.MapFrom(src => src.TemporaryToken))
            .ForMember(dest => dest.TemporaryTokenExpiresAt, opt => opt.MapFrom(src => src.TemporaryTokenExpiresAt));

        CreateMap<UpdateAccountRequest, Account>().ReverseMap();
    }
}
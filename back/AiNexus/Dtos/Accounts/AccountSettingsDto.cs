using Library.Enums.Accounts;
using Library.Helpers.ApplicationExceptions;
using Newtonsoft.Json;

namespace Library.Dtos.Accounts
{
    public class AccountSettingsDto
    {
        [JsonIgnore]
        private Language LanguageType
        {
            get;
            set;
        }
        public string Language
        {
            get => LanguageType.ToString();
            set
            {
                try
                {
                    LanguageType = (Language)Enum.Parse(typeof(Language), value);
                }
                catch (ArgumentException)
                {
                    throw new BadRequestException($"invalid languageType value: select from: [{string.Join(", ", (Language[])Enum.GetValues(typeof(Language)))}]");
                }
            }
        }

        [JsonIgnore]
        private Theme ThemeType
        {
            get;
            set;
        }
        public string Theme
        {
            get => ThemeType.ToString();
            set
            {
                try
                {
                    ThemeType = (Theme)Enum.Parse(typeof(Theme), value);
                }
                catch (ArgumentException)
                {
                    throw new BadRequestException($"invalid themeType value: select from: [{string.Join(", ", (Theme[])Enum.GetValues(typeof(Theme)))}]");
                }
            }
        }
    }
}

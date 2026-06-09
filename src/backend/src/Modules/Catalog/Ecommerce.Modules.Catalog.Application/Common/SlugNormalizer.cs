using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Ecommerce.Modules.Catalog.Application.Common;

/// <summary>Normaliza strings para uso como slug de URL.</summary>
public static partial class SlugNormalizer
{
    public static string Normalize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category is UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            builder.Append(character);
        }

        var slug = builder.ToString().Normalize(NormalizationForm.FormC);
        slug = slug.Replace(' ', '-');
        slug = InvalidSlugCharacters().Replace(slug, string.Empty);
        slug = MultipleHyphens().Replace(slug, "-").Trim('-');

        return slug;
    }

    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex InvalidSlugCharacters();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleHyphens();
}

using Ecommerce.Modules.Catalog.Domain.Entities;
using Ecommerce.Modules.Catalog.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence.Seed;

public static partial class DatabaseSeeder
{
    private static async Task SeedPromotionsAsync(
        EcommerceDbContext context,
        CancellationToken cancellationToken)
    {
        if (await context.Promotions.AnyAsync(cancellationToken))
        {
            return;
        }

        var promotions = new[]
        {
            new Promotion(
                Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
                "mega-ofertas",
                "Mega Ofertas",
                "Até 50% OFF em produtos selecionados",
                "Frete grátis acima de R$ 99 · Parcelamento em até 12x sem juros",
                "50%",
                "de desconto",
                "bg-gradient-to-r from-brand via-[#ff6b35] to-accent",
                PromotionFilterType.HasDiscount,
                null,
                null,
                null,
                0,
                null,
                null,
                DateTime.UtcNow),
            new Promotion(
                Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                "dia-das-maes",
                "Dia das Mães",
                "Presentes especiais para quem você ama",
                "Seleção curada com os melhores preços da temporada",
                "MÃES",
                "promoção",
                "bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#f472b6]",
                PromotionFilterType.Keywords,
                null,
                null,
                "presente,fone,bluetooth,áudio",
                1,
                null,
                null,
                DateTime.UtcNow),
            new Promotion(
                Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                "frete-gratis",
                "Frete Grátis",
                "Compre com entrega gratuita",
                "Válido para pedidos acima de R$ 99 em todo o Brasil",
                "R$0",
                "de frete",
                "bg-gradient-to-r from-[#067d62] via-[#059669] to-[#34d399]",
                PromotionFilterType.MinPrice,
                null,
                99m,
                null,
                2,
                null,
                null,
                DateTime.UtcNow),
            new Promotion(
                Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                "eletronicos",
                "Tecnologia",
                "Eletrônicos com preços imperdíveis",
                "Fones, acessórios e gadgets com entrega rápida",
                "TECH",
                "seleção",
                "bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#60a5fa]",
                PromotionFilterType.Category,
                ElectronicsCategoryId,
                null,
                null,
                3,
                null,
                null,
                DateTime.UtcNow),
            new Promotion(
                Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5"),
                "lancamentos",
                "Novidades",
                "Confira os lançamentos da semana",
                "Produtos recém-chegados ao catálogo",
                "NEW",
                "lançamentos",
                "bg-gradient-to-r from-[#4c1d95] via-[#7c3aed] to-[#a78bfa]",
                PromotionFilterType.AllProducts,
                null,
                null,
                null,
                4,
                null,
                null,
                DateTime.UtcNow)
        };

        context.Promotions.AddRange(promotions);
        await context.SaveChangesAsync(cancellationToken);
    }
}

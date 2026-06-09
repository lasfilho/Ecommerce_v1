using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class ExpandProductCatalogFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "long_description",
            schema: "catalog",
            table: "products",
            type: "character varying(8000)",
            maxLength: 8000,
            nullable: true);

        migrationBuilder.AddColumn<decimal>(
            name: "promotional_price",
            schema: "catalog",
            table: "products",
            type: "numeric(18,2)",
            precision: 18,
            scale: 2,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "short_description",
            schema: "catalog",
            table: "products",
            type: "character varying(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.Sql(
            """
            UPDATE catalog.products
            SET short_description = LEFT(description, 500)
            WHERE description IS NOT NULL;
            """);

        migrationBuilder.DropColumn(
            name: "description",
            schema: "catalog",
            table: "products");

        migrationBuilder.CreateIndex(
            name: "ix_products_price",
            schema: "catalog",
            table: "products",
            column: "price");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_products_price",
            schema: "catalog",
            table: "products");

        migrationBuilder.AddColumn<string>(
            name: "description",
            schema: "catalog",
            table: "products",
            type: "character varying(4000)",
            maxLength: 4000,
            nullable: true);

        migrationBuilder.Sql(
            """
            UPDATE catalog.products
            SET description = short_description
            WHERE short_description IS NOT NULL;
            """);

        migrationBuilder.DropColumn(
            name: "long_description",
            schema: "catalog",
            table: "products");

        migrationBuilder.DropColumn(
            name: "promotional_price",
            schema: "catalog",
            table: "products");

        migrationBuilder.DropColumn(
            name: "short_description",
            schema: "catalog",
            table: "products");
    }
}

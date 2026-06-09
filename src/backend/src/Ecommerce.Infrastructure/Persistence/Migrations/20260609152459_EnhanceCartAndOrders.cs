using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class EnhanceCartAndOrders : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_carts_session_id",
            schema: "cart",
            table: "carts");

        migrationBuilder.DropIndex(
            name: "ix_carts_user_id",
            schema: "cart",
            table: "carts");

        migrationBuilder.DropColumn(
            name: "session_id",
            schema: "cart",
            table: "carts");

        migrationBuilder.AddColumn<DateTime>(
            name: "cancelled_at",
            schema: "orders",
            table: "orders",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "cart_id",
            schema: "orders",
            table: "orders",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.AddColumn<DateTime>(
            name: "delivered_at",
            schema: "orders",
            table: "orders",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "paid_at",
            schema: "orders",
            table: "orders",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "processing_at",
            schema: "orders",
            table: "orders",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "shipped_at",
            schema: "orders",
            table: "orders",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "user_id",
            schema: "cart",
            table: "carts",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_orders_cart_id",
            schema: "orders",
            table: "orders",
            column: "cart_id");

        migrationBuilder.CreateIndex(
            name: "ix_carts_user_id",
            schema: "cart",
            table: "carts",
            column: "user_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_orders_cart_id",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropIndex(
            name: "ix_carts_user_id",
            schema: "cart",
            table: "carts");

        migrationBuilder.DropColumn(
            name: "cancelled_at",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "cart_id",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "delivered_at",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "paid_at",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "processing_at",
            schema: "orders",
            table: "orders");

        migrationBuilder.DropColumn(
            name: "shipped_at",
            schema: "orders",
            table: "orders");

        migrationBuilder.AlterColumn<Guid>(
            name: "user_id",
            schema: "cart",
            table: "carts",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AddColumn<string>(
            name: "session_id",
            schema: "cart",
            table: "carts",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_carts_session_id",
            schema: "cart",
            table: "carts",
            column: "session_id",
            filter: "session_id IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "ix_carts_user_id",
            schema: "cart",
            table: "carts",
            column: "user_id",
            filter: "user_id IS NOT NULL");
    }
}

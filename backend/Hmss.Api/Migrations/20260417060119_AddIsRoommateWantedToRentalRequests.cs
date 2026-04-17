using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hmss.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsRoommateWantedToRentalRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRoommateWanted",
                table: "RentalRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "RentalRequests",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PayOSOrderCode = table.Column<long>(type: "bigint", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PaymentId);
                    table.CheckConstraint("CK_Payment_Status", "Status IN ('Pending', 'Paid', 'Cancelled', 'Failed')");
                    table.ForeignKey(
                        name: "FK_Payments_RentalRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "RentalRequests",
                        principalColumn: "RequestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "PasswordHash",
                value: "$2a$11$09O1a7JRKtDvzTpD5Vknx.WSnUjfNDSjZUVZWiZsheoNRt1DsqjVa");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                column: "PasswordHash",
                value: "$2a$11$kecoJ1Jrg5DYM1Lh34smCuwZ/QbVFbU5a9EQ5Eiudb0bhhwoILJB6");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                column: "PasswordHash",
                value: "$2a$11$U9PsQ1KMQ4/Of.TkYVIvX.wb7PQPi0fCT8.ygE0F.6LgvrKQacIrG");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"),
                column: "PasswordHash",
                value: "$2a$11$tkXLcQnFkY5iBK29iriG4Ox8nMMbCzDh2xgdfgZhWen8h8dHCNHK6");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"),
                column: "PasswordHash",
                value: "$2a$11$6HCMJBN8wdz0/GGQ7S02ROz9oLC83zy4K2j3RIi4oNOIB53P6pU6e");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"),
                column: "PasswordHash",
                value: "$2a$11$/wHFcb13zxIjNf8VedBJiOnWUK44Vxf/MOowr7TA3IrN7N9ftWgxe");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"),
                column: "PasswordHash",
                value: "$2a$11$S7ueqO1HEOtmh8/y1Qmjb.Ca3EVK3RqXhWLCTddyOyajdb3fTY6Vq");

            migrationBuilder.AddCheckConstraint(
                name: "CK_RentalRequest_PaymentStatus",
                table: "RentalRequests",
                sql: "PaymentStatus IN ('Unpaid', 'Paid', 'Failed')");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_RequestId",
                table: "Payments",
                column: "RequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_RentalRequest_PaymentStatus",
                table: "RentalRequests");

            migrationBuilder.DropColumn(
                name: "IsRoommateWanted",
                table: "RentalRequests");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "RentalRequests");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "PasswordHash",
                value: "$2a$11$.xiHVGhdLQuhJju6xaikaup9tH3uMKd9bh6KtvXn80Se6P3adwNJC");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                column: "PasswordHash",
                value: "$2a$11$/4dlW08KauFF1OFfP7r79OpYl28zJKu8.4oCpV2WTWsCHP2Xso0XS");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                column: "PasswordHash",
                value: "$2a$11$A39f14qYzTS2zbyjpjq/zO0MFhDGBTTnerrwTUEO/qhTqeKuEINne");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"),
                column: "PasswordHash",
                value: "$2a$11$PcJPJUrOLexSnouaA5M48u9ESS2e.llBwlfwh8pOgRFB4EN8.bqkC");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"),
                column: "PasswordHash",
                value: "$2a$11$LhPSDwlEcrr9wWxVnHhW6OUNbuns40Ic3HDJ1DggUrPhg0V/x6bGa");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"),
                column: "PasswordHash",
                value: "$2a$11$bvOgpfP3d60bMofO5x1bgeJexkHpDYo52.aeiaN8rqxRjAPjBMXZm");

            migrationBuilder.UpdateData(
                table: "UserAccounts",
                keyColumn: "UserId",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"),
                column: "PasswordHash",
                value: "$2a$11$pbMw3Xp3WeS2iP9ElFOsyuCLi3RM3I7Gsms03J.PdudrfEzfXKmga");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hmss.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyImagesRef : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagesRef",
                table: "Properties",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagesRef",
                table: "Properties");
        }
    }
}

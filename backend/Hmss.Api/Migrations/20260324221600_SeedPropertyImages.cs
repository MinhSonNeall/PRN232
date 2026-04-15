using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hmss.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedPropertyImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Sunrise Hostel
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000010'""");

            // Central Park Residences
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000011'""");

            // Saigon Garden Hostel
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000012'""");

            // Beachside Retreat
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000013'""");

            // Mountain View Lodge
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800","https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000014'""");

            // University Quarter House
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800","https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800"]' WHERE [PropertyId] = '00000000-0000-0000-0000-000000000015'""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """UPDATE [Properties] SET [ImagesRef] = NULL WHERE [PropertyId] IN ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015')""");
        }
    }
}

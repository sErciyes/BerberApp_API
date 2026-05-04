using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BerberApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddBarberUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Barbers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Barbers_UserId",
                table: "Barbers",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Barbers_Users_UserId",
                table: "Barbers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Barbers_Users_UserId",
                table: "Barbers");

            migrationBuilder.DropIndex(
                name: "IX_Barbers_UserId",
                table: "Barbers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Barbers");
        }
    }
}

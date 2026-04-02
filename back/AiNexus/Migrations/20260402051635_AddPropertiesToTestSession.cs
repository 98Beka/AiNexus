using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiNexus.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertiesToTestSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EditReason",
                table: "TestSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EditScore",
                table: "TestSessions",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EditReason",
                table: "TestSessions");

            migrationBuilder.DropColumn(
                name: "EditScore",
                table: "TestSessions");
        }
    }
}

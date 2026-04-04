using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiNexus.Migrations
{
    /// <inheritdoc />
    public partial class add_preview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Preview",
                table: "Applicants",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Preview",
                table: "Applicants");
        }
    }
}

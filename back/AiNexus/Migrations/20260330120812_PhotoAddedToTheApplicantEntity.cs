using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiNexus.Migrations
{
    /// <inheritdoc />
    public partial class PhotoAddedToTheApplicantEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Photo",
                table: "Applicants",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Photo",
                table: "Applicants");
        }
    }
}

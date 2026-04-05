using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiNexus.Migrations
{
    /// <inheritdoc />
    public partial class addStudyArea : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Score",
                table: "Applicants");

            migrationBuilder.RenameColumn(
                name: "TestResultDetails",
                table: "Applicants",
                newName: "StudyArea");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StudyArea",
                table: "Applicants",
                newName: "TestResultDetails");

            migrationBuilder.AddColumn<int>(
                name: "Score",
                table: "Applicants",
                type: "integer",
                nullable: true);
        }
    }
}

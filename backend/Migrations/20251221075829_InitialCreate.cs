using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "devices",
                columns: table => new
                {
                    device_mac = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    registered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_devices", x => x.device_mac);
                    table.ForeignKey(
                        name: "FK_devices_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "device_users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_mac = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hash = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_users", x => x.id);
                    table.ForeignKey(
                        name: "FK_device_users_devices_device_mac",
                        column: x => x.device_mac,
                        principalTable: "devices",
                        principalColumn: "device_mac",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_device_users_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "measurements",
                columns: table => new
                {
                    measurement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_mac = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_users_id = table.Column<Guid>(type: "uuid", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    temperature = table.Column<float>(type: "real", nullable: true),
                    co2 = table.Column<double>(type: "double precision", nullable: false),
                    humidity = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_measurements", x => x.measurement_id);
                    table.ForeignKey(
                        name: "FK_measurements_device_users_device_users_id",
                        column: x => x.device_users_id,
                        principalTable: "device_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_measurements_devices_device_mac",
                        column: x => x.device_mac,
                        principalTable: "devices",
                        principalColumn: "device_mac",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_measurements_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_device_users_device_mac",
                table: "device_users",
                column: "device_mac");

            migrationBuilder.CreateIndex(
                name: "IX_device_users_user_id",
                table: "device_users",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_devices_user_id",
                table: "devices",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_measurements_device_mac",
                table: "measurements",
                column: "device_mac");

            migrationBuilder.CreateIndex(
                name: "IX_measurements_device_users_id",
                table: "measurements",
                column: "device_users_id");

            migrationBuilder.CreateIndex(
                name: "IX_measurements_user_id",
                table: "measurements",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "measurements");

            migrationBuilder.DropTable(
                name: "device_users");

            migrationBuilder.DropTable(
                name: "devices");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}

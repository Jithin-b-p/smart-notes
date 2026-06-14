This directory holds local secrets for Docker Compose.
These files are in .gitignore and must NEVER be committed.

To set up locally:
echo "your-postgres-password" > secrets/postgres_password.txt

The password must match what is in your apps/backend/.env:
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/smartnotes"

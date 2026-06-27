# PROJECT-1

## Fixing MongoDB connection on Render

If your app deploys but MongoDB connection fails because of wrong username/password, update the `ATLASDB_URL` environment variable in Render.

1. In MongoDB Atlas, get your connection string ("Connect -> Connect your application"). It looks like:

   mongodb+srv://<USER>:<PASSWORD>@cluster0.mongodb.net/<DBNAME>?retryWrites=true&w=majority

2. URL-encode any special characters in your password (for example `@` -> `%40`).

3. In Render dashboard:
   - Open your web service
   - Go to "Environment" (Environment > Environment Variables)
   - Add or update a variable named `ATLASDB_URL` and paste the full connection string.
   - (Optional) Ensure `SECRET` is set for session store.

4. Redeploy the service after updating environment variables.

Notes
- The app checks `ATLASDB_URL` at startup and will exit with a helpful error if missing.
- If connection still fails, double-check the Atlas user has proper network access and database user privileges.


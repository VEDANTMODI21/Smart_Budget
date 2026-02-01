# Connecting to Online MongoDB (Atlas)

To make your application work on the network and store data in the cloud, follow these steps to set up MongoDB Atlas.

## 1. Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free account and a new project.

## 2. Deploy a Free Cluster
1. Click **"Build a Database"**.
2. Choose the **FREE** (M0) tier.
3. Select a provider (AWS/Google Cloud/Azure) and a region close to you.
4. Click **"Create Cluster"**.

## 3. Configure Database Access
1. Go to **Database Access** (under Security in the sidebar).
2. Click **"Add New Database User"**.
3. Choose **"Password"** as the Authentication Method.
4. Set a username and a **strong password**. Keep these safe.
5. Set Database User Privileges to **"Read and Write to any database"**.
6. Click **"Add User"**.

## 4. Configure Network Access
1. Go to **Network Access** (under Security in the sidebar).
2. Click **"Add IP Address"**.
3. To allow access from anywhere (necessary for network access), click **"Allow Access From Anywhere"** (adds `0.0.0.0/0`).
4. Click **"Confirm"**.

## 5. Get Your Connection String
1. Go to **Database** (under Deployment in the sidebar).
2. Click **"Connect"** on your cluster.
3. Choose **"Drivers"**.
4. Copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

## 6. Update Your `.env` File
1. Open your `.env` file in the project root.
2. Replace the `MONGODB_URI` line with your Atlas connection string.
3. **CRITICAL:** Replace `<password>` with the actual password you created for your database user (remove the `<` and `>` symbols).
4. You can also specify the database name after the `/` and before the `?`, for example:
   `MONGODB_URI=mongodb+srv://admin:mypassword@cluster0.abcde.mongodb.net/smart-budget?retryWrites=true&w=majority`

## 7. To Work on Local Network (Access from other devices)
If you want to access the app from other devices on your WiFi:
1. Run `npm run server` or `npm run dev:all`.
2. Look for the **Network** URL in the console (e.g., `http://192.168.1.10:5000`).
3. Update your `.env` file's `VITE_API_URL` to use this IP instead of `localhost`:
   `VITE_API_URL=http://192.168.1.10:5000`
4. Restart your servers.
5. On your other device (e.g. phone), visit `http://192.168.1.10:5173`.

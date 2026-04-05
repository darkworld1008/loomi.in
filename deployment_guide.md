# Loomi: Render Deployment Guide

Your application is already in excellent shape to be hosted on [Render](https://render.com). Because your `app.py` relies on `os.environ.get("MONGO_URI")` and your `requirements.txt` includes `gunicorn` (the production web server for Flask), the deployment will be very straightforward!

Here is the step-by-step process of what you should do to get it hosted:

### Step 1: Upload Your Code to GitHub
Render connects to a GitHub or GitLab repository to automatically deploy your updates.
1. Go to [GitHub](https://github.com/) and create a new repository (e.g., `loomi-store`).
2. Open a terminal in your project directory (where `app.py` is located) and run the following commands to push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
*(Note: I have already created a `.gitignore` file for you so that unnecessary files like `loomi.zip` and python caches are skipped!)*

### Step 2: Create a Web Service on Render
1. Create a free account on [Render](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `loomi-store` repository.

### Step 3: Configure the Web Service
Fill in the deployment details on Render as follows:
- **Name**: `loomi-store` (or whatever you prefer)
- **Region**: Select the region closest to your customers (e.g., Singapore or Frankfurt).
- **Branch**: `main`
- **Root Directory**: *(leave blank)*
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

### Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and add the following keys. These match exactly what `app.py` expects:

1. **`MONGO_URI`**: Set this to your MongoDB Atlas connection string (where orders will be reliably stored).
   *(e.g., `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)*
2. **`SMTP_EMAIL`**: (Optional) The email address you want to use to send out order notifications.
3. **`SMTP_PASSWORD`**: (Optional) App password for the above email.
4. **`STORE_OWNER_EMAIL`**: (Optional) The email address where order notifications should be sent.

### Step 5: Deploy!
Click **Create Web Service** at the bottom.
Render will now pull your code, install the requirements, and start your app using `gunicorn`. Within a couple of minutes, your public URL (like `loomi-store.onrender.com`) will be live and ready for customers!

> **Database Storage:** Because Render's free tier spins down an app after 15 minutes of inactivity (resetting any local files in the process), using your **MongoDB** setup instead of local files is the perfect choice to ensure order data is safely preserved.

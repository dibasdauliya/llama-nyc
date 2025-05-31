# AWS RDS Connection Troubleshooting Guide

## 🚨 Error: Can't reach database server

Your error indicates that the application cannot connect to your RDS instance. Here's how to fix it:

## Step 1: Check RDS Instance Status

1. **Go to AWS RDS Console**
   - https://console.aws.amazon.com/rds/
   - Region: `us-east-2` (Ohio) - based on your endpoint

2. **Check Instance Status**
   - Find `database-1` instance
   - Status should be "Available"
   - If "Creating", wait 5-10 minutes

## Step 2: Enable Public Accessibility

1. **Click on your database instance** (`database-1`)
2. **Click "Modify" button**
3. **In "Connectivity" section:**
   - Find "Public accessibility"
   - Select "Yes"
4. **Scroll down and click "Continue"**
5. **Select "Apply immediately"**
6. **Click "Modify DB instance"**

## Step 3: Fix Security Group

This is the most common issue. Your security group needs to allow PostgreSQL connections.

1. **In RDS instance details, find "Security group rules"**
2. **Click on the security group link**
3. **Click "Edit inbound rules"**
4. **Add these rules:**

   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | PostgreSQL | TCP | 5432 | My IP | Development access |
   | PostgreSQL | TCP | 5432 | 0.0.0.0/0 | Temporary - All IPs (less secure) |

5. **Click "Save rules"**

## Step 4: Verify Database Configuration

1. **In RDS Console, check these details:**
   - Endpoint: `database-1.cp0cugemsbw6.us-east-2.rds.amazonaws.com`
   - Port: `5432`
   - Database name: `ai_interviewer` (or whatever you set)
   - Master username: `postgres` (or your username)

2. **Update your `.env.local**:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@database-1.cp0cugemsbw6.us-east-2.rds.amazonaws.com:5432/ai_interviewer?sslmode=require"
   ```

## Step 5: Test Connection

```bash
# Test with psql
psql "postgresql://postgres:YOUR_PASSWORD@database-1.cp0cugemsbw6.us-east-2.rds.amazonaws.com:5432/ai_interviewer?sslmode=require"

# Or test with telnet
telnet database-1.cp0cugemsbw6.us-east-2.rds.amazonaws.com 5432
```

## Step 6: Common Issues & Solutions

### Issue 1: VPC/Subnet Configuration
- Ensure RDS is in a public subnet if you need external access
- Or set up VPC peering/VPN for private access

### Issue 2: Wrong Password
- Double-check your master password
- No special characters that might need escaping in the URL

### Issue 3: Database Not Created
- The initial database might not exist
- Connect without specifying database first:
  ```
  postgresql://postgres:PASSWORD@endpoint:5432/postgres?sslmode=require
  ```
- Then create database:
  ```sql
  CREATE DATABASE ai_interviewer;
  ```

### Issue 4: SSL/TLS Issues
- Try without SSL first (for testing only):
  ```
  postgresql://postgres:PASSWORD@endpoint:5432/ai_interviewer
  ```

## Quick Fix Script

Create a file `test-db.js`:

```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Details:', err);
  }
}

testConnection();
```

Run:
```bash
npm install pg
node test-db.js
```

## If Nothing Works

1. **Create a new RDS instance** with:
   - Public accessibility: Yes
   - New security group
   - Default VPC
   - Initial database name: `ai_interviewer`

2. **Alternative: Use local PostgreSQL for now**
   ```bash
   # Install PostgreSQL locally
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb ai_interviewer
   
   # Update .env.local
   DATABASE_URL="postgresql://localhost:5432/ai_interviewer"
   ```

## Need More Help?

Check:
- AWS CloudTrail logs for API errors
- RDS logs in the console
- VPC flow logs for network issues

Common working DATABASE_URL format:
```
postgresql://[username]:[password]@[endpoint]:5432/[database]?sslmode=require
```

Your specific URL should look like:
```
postgresql://postgres:YourActualPassword@database-1.cp0cugemsbw6.us-east-2.rds.amazonaws.com:5432/ai_interviewer?sslmode=require
``` 
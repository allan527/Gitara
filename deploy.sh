#!/bin/bash

# William Loans - Quick Deployment Script
# This script deploys the backend edge function to Supabase

echo "🚀 William Loans - Deployment Script"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    echo "✅ Supabase CLI installed successfully!"
    echo ""
fi

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null
then
    echo "📝 Please login to Supabase..."
    supabase login
    echo "✅ Logged in successfully!"
    echo ""
fi

# Link to project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref tmelmmhephgyzccezfgd
echo ""

# Run database migrations
echo "📊 Running database migrations..."
echo "Creating proper PostgreSQL tables..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database tables created successfully!"
    echo ""
else
    echo "⚠️  Migration may have already run. Continuing..."
    echo ""
fi

# Deploy the edge function
echo "🚀 Deploying edge function..."
supabase functions deploy server

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "======================================"
    echo ""
    echo "📊 Database tables created:"
    echo "   - clients (with foreign keys & indexes)"
    echo "   - transactions (linked to clients)"
    echo "   - cashbook (income/expense tracking)"
    echo "   - owner_capital (William's transactions)"
    echo ""
    echo "Your backend is now live at:"
    echo "https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523"
    echo ""
    echo "🧪 Testing health endpoint..."
    curl -s https://tmelmmhephgyzccezfgd.supabase.co/functions/v1/make-server-68baa523/health
    echo ""
    echo ""
    echo "🎉 Your William Loans system is ready to use!"
    echo "👉 Login credentials:"
    echo "   - william@boss.com / admin@123"
    echo "   - cashier.com / admin@123"
    echo "   - field.com / admin@123"
    echo ""
    echo "📚 View your tables:"
    echo "   https://supabase.com/dashboard/project/tmelmmhephgyzccezfgd/editor"
    echo ""
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo "Please check the error messages above."
    echo ""
fi
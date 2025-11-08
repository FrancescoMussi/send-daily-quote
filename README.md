# Daily Quote Emailer 📧✨

Sends inspirational quotes twice daily via email using Vercel Cron Jobs and Resend.

## Features
- 🎯 Random quote selection from curated collection
- 📅 Automated daily delivery (8 AM & 8 PM UTC)
- 💌 Beautiful HTML email template
- 🚀 Serverless deployment on Vercel
- 🆓 Free tier friendly

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` with your details:

```env
RESEND_API_KEY=re_your_actual_api_key
EMAIL_RECIPIENTS=your-email@example.com,friend@example.com
FROM_EMAIL=Daily Quotes <onboarding@resend.dev>
CRON_SECRET=generate_a_random_string_here
```

**Get your Resend API Key:**
1. Sign up at https://resend.com
2. Go to API Keys section
3. Create a new API key
4. Copy and paste into `.env.local`

**Generate CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Test Locally (Optional)

Install Vercel CLI:
```bash
npm i -g vercel
```

Run locally:
```bash
vercel dev
```

Test the endpoint:
```bash
curl -X GET "http://localhost:3000/api/send-quote" \
  -H "Authorization: Bearer your_cron_secret_here"
```

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables in project settings:
   - `RESEND_API_KEY`
   - `EMAIL_RECIPIENTS`
   - `FROM_EMAIL`
   - `CRON_SECRET`
5. Deploy!

### 5. Verify Cron Jobs

After deployment:
1. Go to your Vercel project dashboard
2. Navigate to "Cron Jobs" tab
3. You should see two scheduled jobs:
   - `0 8 * * *` (8 AM UTC)
   - `0 20 * * *` (8 PM UTC)

## Customization

### Change Schedule Times

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/send-quote",
      "schedule": "0 9 * * *"  // 9 AM UTC
    }
  ]
}
```

**Cron format:** `minute hour day month dayOfWeek`

Examples:
- `0 8 * * *` - Every day at 8 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9 AM

### Add More Quotes

Edit `api/send-quote.js` and add to the `quotes` array:

```javascript
const quotes = [
  "Your new quote here. - Author Name",
  // ... more quotes
];
```

### Customize Email Design

Modify the HTML template in `api/send-quote.js` (look for the `html:` section).

## Troubleshooting

### Emails not sending?
1. Check Vercel logs for errors
2. Verify RESEND_API_KEY is correct
3. Ensure EMAIL_RECIPIENTS format is correct
4. Check Resend dashboard for delivery status

### Cron not running?
1. Cron jobs only work on production deployments (not preview)
2. Check "Cron Jobs" tab in Vercel dashboard
3. Verify `vercel.json` syntax is correct

### Using custom domain for emails?
1. Verify your domain in Resend dashboard
2. Update `FROM_EMAIL` to use your domain
3. Example: `FROM_EMAIL=quotes@yourdomain.com`

## Tech Stack
- **Vercel** - Serverless hosting & cron jobs
- **Resend** - Email delivery
- **Node.js** - Runtime environment

## License
MIT

## Support
For issues or questions, check:
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- [Resend Documentation](https://resend.com/docs)
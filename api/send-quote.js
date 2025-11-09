import { Resend } from 'resend';
import { tolle } from '../quotes/tolle.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to get random quote from tolle array
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * tolle.length);
  return tolle[randomIndex];
}

// Main handler function
export default async function handler(req, res) {
  // Verify this is a cron job request (optional security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const quoteObj = getRandomQuote();
    const { quote: text, author, book } = quoteObj;
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get recipients from environment variable
    const recipients = process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim());
    console.log('Recipients:', recipients);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Daily Quotes <onboarding@resend.dev>',
      to: recipients,
      subject: `Daily Inspiration - ${today}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
              }
              .content {
                padding: 50px 40px;
              }
              .quote-container {
                position: relative;
                margin: 30px 0;
              }
              .quote-mark {
                font-size: 60px;
                color: #667eea;
                opacity: 0.2;
                position: absolute;
                top: -20px;
                left: -10px;
                font-family: Georgia, serif;
              }
              .quote {
                font-size: 22px;
                color: #333;
                line-height: 1.6;
                text-align: center;
                margin: 0;
                padding: 30px 20px;
                background-color: #f9f9f9;
                border-left: 4px solid #667eea;
                border-radius: 8px;
                position: relative;
              }
              .author {
                font-size: 16px;
                color: #666;
                text-align: center;
                margin-top: 20px;
                font-weight: 500;
              }
              .footer {
                text-align: center;
                padding: 30px;
                color: #888;
                font-size: 13px;
                background-color: #f9f9f9;
                border-top: 1px solid #eee;
              }
              .footer a {
                color: #667eea;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Daily Inspiration</h1>
                <p>${today}</p>
              </div>
              <div class="content">
                <div class="quote-container">
                  <div class="quote-mark">"</div>
                  <p class="quote">${text}</p>
                </div>
                <p class="author">— ${author}</p>
                <p style="text-align: center; color: #999; font-size: 14px; margin-top: 10px; font-style: italic;">${book}</p>
              </div>
              <div class="footer">
                <p>Have a wonderful day! 🌟</p>
                <p style="margin-top: 10px; font-size: 12px;">
                  You're receiving this because you subscribed to daily inspirational quotes.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Quote sent successfully',
      quote: text,
      author: author,
      book: book,
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ 
      error: 'Failed to send quote',
      details: error.message 
    });
  }
}
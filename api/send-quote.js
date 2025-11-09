import { Resend } from 'resend'
import { tolle } from '../quotes/tolle.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const escapeHtml = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getRandomQuote = () => tolle[Math.floor(Math.random() * tolle.length)]

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { quote, author, book } = getRandomQuote()
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const recipients = process.env.EMAIL_RECIPIENTS.split(',').map(e => e.trim())

    const preheader = `Your daily inspiration for ${today}`
    const subject = `Daily Inspiration — ${today}`

    const textAlt =
`“${quote}”
— ${author}
${book ? `(${book})` : ''}

Have a wonderful day!
You’re receiving this because you subscribed to Daily Inspiration.`

    const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${subject}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .bg-body { background:#0b0c0e !important }
      .bg-card { background:#15171a !important }
      .muted { color:#9aa2ad !important }
      .title, .quote, .author { color:#e6e7e9 !important }
      .bar { border-color:#3b82f6 !important }
    }
    a { text-decoration:none }
  </style>
</head>
<body style="margin:0;background:#f2f4f7" class="bg-body">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7" class="bg-body">
    <tr>
      <td align="center" style="padding:24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px" class="bg-card">
          <tr>
            <td align="center" style="padding:28px 24px;background:#3b82f6;border-top-left-radius:12px;border-top-right-radius:12px">
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff;font-size:24px;line-height:1.3" class="title">✨ Daily Inspiration</div>
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#eaf2ff;opacity:.95;font-size:14px;margin-top:6px">${today}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 28px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-family:Georgia,serif;font-size:48px;line-height:1;color:#3b82f6;opacity:.25">“</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:1.7;color:#1f2937;text-align:center;padding:20px 16px;background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px" class="quote bar">
                      ${escapeHtml(quote)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:18px">
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;color:#4b5563" class="author">— ${escapeHtml(author)}</div>
                    ${book ? `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;margin-top:6px;font-style:italic" class="muted">${escapeHtml(book)}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-top:1px solid #e5e7eb;background:#f8fafc;border-bottom-left-radius:12px;border-bottom-right-radius:12px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280" class="muted">
                      Have a wonderful day ✨
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Daily Quotes <onboarding@resend.dev>',
      to: recipients,
      subject,
      html,
      text: textAlt
    })

    if (error) {
      console.error('Error sending email:', error)
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Quote sent successfully',
      quote,
      author,
      book,
      emailId: data.id
    })
  } catch (err) {
    console.error('Error in handler:', err)
    return res.status(500).json({
      error: 'Failed to send quote',
      details: err.message
    })
  }
}

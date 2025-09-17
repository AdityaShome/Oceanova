import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/email-service'
import nodemailer from 'nodemailer'

// Create transporter for admin emails
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_EMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle data submission with file upload
      const formData = await request.formData()
      
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const institution = formData.get('institution') as string
      const verificationCode = formData.get('verificationCode') as string
      const description = formData.get('description') as string
      const file = formData.get('file') as File | null

      // Validate required fields
      if (!name || !email || !institution || !verificationCode || !description) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Prepare email content
      let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0891b2 100%); padding: 40px; border-radius: 20px; color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              📊
            </div>
            <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">New Data Submission</h1>
            <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">AI Biodiversity Platform</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            <h2 style="color: white; margin: 0 0 20px; font-size: 24px;">Data Submission Details</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Researcher Information</h3>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Institution:</strong> ${institution}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Verification Code:</strong> ${verificationCode}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Data Description</h3>
              <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">${description}</p>
              </div>
            </div>
            
            ${file ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Attached File</h3>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Filename:</strong> ${file.name}</p>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Type:</strong> ${file.type}</p>
              </div>
            ` : ''}
            
            <div style="background: rgba(6, 182, 212, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #06b6d4; margin: 0 0 15px; font-size: 18px;">Next Steps</h3>
              <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review the submitted data and credentials</li>
                <li style="margin-bottom: 8px;">Verify the researcher's identity and institution</li>
                <li style="margin-bottom: 8px;">Evaluate the data quality and relevance</li>
                <li style="margin-bottom: 8px;">Contact the researcher if additional information is needed</li>
                <li style="margin-bottom: 8px;">Process the data for inclusion in the database</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2024 AI Biodiversity Platform. All rights reserved.</p>
            <p style="margin: 10px 0 0;">This is an automated notification from the data submission system.</p>
          </div>
        </div>
      `

      // Send email to admin
      const mailOptions = {
        from: process.env.HOST_EMAIL,
        to: process.env.HOST_EMAIL, // Send to admin
        subject: `New Data Submission from ${name} - AI Biodiversity Platform`,
        html: emailContent,
        attachments: file ? [{
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type
        }] : []
      }

      await transporter.sendMail(mailOptions)

      return NextResponse.json({ success: true, message: 'Data submission sent successfully' })

    } else {
      // Handle contact form submission
      const body = await request.json()
      const { type, firstName, lastName, email, institution, message } = body

      if (type !== 'contact') {
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        )
      }

      // Validate required fields
      if (!firstName || !lastName || !email || !institution || !message) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Prepare email content
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0891b2 100%); padding: 40px; border-radius: 20px; color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              💬
            </div>
            <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">New Contact Message</h1>
            <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">AI Biodiversity Platform</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            <h2 style="color: white; margin: 0 0 20px; font-size: 24px;">Contact Details</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Contact Information</h3>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Institution:</strong> ${institution}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Message</h3>
              <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">${message}</p>
              </div>
            </div>
            
            <div style="background: rgba(6, 182, 212, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #06b6d4; margin: 0 0 15px; font-size: 18px;">Response Required</h3>
              <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">
                Please respond to this inquiry within 24-48 hours to maintain our high standards of customer service.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2024 AI Biodiversity Platform. All rights reserved.</p>
            <p style="margin: 10px 0 0;">This is an automated notification from the contact system.</p>
          </div>
        </div>
      `

      // Send email to admin
      const mailOptions = {
        from: process.env.HOST_EMAIL,
        to: process.env.HOST_EMAIL, // Send to admin
        subject: `New Contact Message from ${firstName} ${lastName} - AI Biodiversity Platform`,
        html: emailContent
      }

      await transporter.sendMail(mailOptions)

      return NextResponse.json({ success: true, message: 'Contact message sent successfully' })
    }

  } catch (error) {
    console.error('Error sending admin message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const queueService = require('./queueService');

class EmailService {
  constructor() {
    // Initialize SendGrid
    if (config.email.sendgrid.apiKey) {
      sgMail.setApiKey(config.email.sendgrid.apiKey);
      this.useSendGrid = true;
      logger.info('SendGrid initialized');
    } else {
      this.useSendGrid = false;
      logger.warn('SendGrid not configured');
    }

    // Initialize SMTP (fallback)
    if (config.email.smtp.host && config.email.smtp.user) {
      this.transporter = nodemailer.createTransporter({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.password,
        },
      });
      logger.info('SMTP transporter initialized');
    } else {
      this.transporter = null;
      logger.warn('SMTP not configured');
    }

    // Template cache
    this.templateCache = {};

    // Setup queue processor if enabled
    if (config.features.queue) {
      this.setupQueueProcessor();
    }
  }

  /**
   * Setup queue processor for emails
   */
  setupQueueProcessor() {
    queueService.processEmail(async (emailData) => {
      return await this.sendDirectly(emailData);
    });
  }

  /**
   * Load and compile email template
   */
  loadTemplate(templateName) {
    if (this.templateCache[templateName]) {
      return this.templateCache[templateName];
    }

    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiled = handlebars.compile(templateContent);
      this.templateCache[templateName] = compiled;
      return compiled;
    } catch (error) {
      logger.error(`Failed to load template ${templateName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send email (queued or direct)
   */
  async send(emailData, useQueue = true) {
    if (useQueue && config.features.queue) {
      return await queueService.addEmail(emailData);
    } else {
      return await this.sendDirectly(emailData);
    }
  }

  /**
   * Send email directly (without queue)
   */
  async sendDirectly(emailData) {
    const { to, subject, template, data, attachments } = emailData;

    try {
      // Compile template if provided
      let html = emailData.html;
      if (template) {
        const compiledTemplate = this.loadTemplate(template);
        html = compiledTemplate(data || {});
      }

      // Send via SendGrid if configured
      if (this.useSendGrid) {
        const msg = {
          to,
          from: config.email.from,
          subject,
          html,
          attachments: attachments || [],
        };

        await sgMail.send(msg);
        logger.info(`Email sent via SendGrid to ${to}`);
        return { success: true, provider: 'sendgrid' };
      }

      // Fallback to SMTP
      if (this.transporter) {
        const mailOptions = {
          from: config.email.from,
          to,
          subject,
          html,
          attachments: attachments || [],
        };

        await this.transporter.sendMail(mailOptions);
        logger.info(`Email sent via SMTP to ${to}`);
        return { success: true, provider: 'smtp' };
      }

      throw new Error('No email provider configured');
    } catch (error) {
      logger.error(`Email send error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    return await this.send({
      to: user.email,
      subject: 'Welcome to EkA-Ai!',
      template: 'welcome',
      data: {
        name: user.name,
        email: user.email,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
      },
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    return await this.send({
      to: user.email,
      subject: 'Verify Your Email - EkA-Ai',
      template: 'email-verification',
      data: {
        name: user.name,
        verificationUrl,
        expiresIn: '24 hours',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    return await this.send({
      to: user.email,
      subject: 'Reset Your Password - EkA-Ai',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl,
        expiresIn: '1 hour',
      },
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(user, invoice) {
    return await this.send({
      to: user.email,
      subject: `Invoice ${invoice.invoiceNumber} - EkA-Ai`,
      template: 'invoice',
      data: {
        name: user.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        date: invoice.createdAt,
        items: invoice.items,
        pdfUrl: invoice.pdfUrl,
      },
      attachments: invoice.pdfUrl ? [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          path: invoice.pdfUrl,
        }
      ] : [],
    });
  }

  /**
   * Send service reminder email
   */
  async sendServiceReminderEmail(user, vehicle, serviceType) {
    return await this.send({
      to: user.email,
      subject: `Service Reminder: ${vehicle.make} ${vehicle.model}`,
      template: 'service-reminder',
      data: {
        name: user.name,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year,
        serviceType,
        mileage: vehicle.mileage,
        dashboardUrl: `${config.frontendUrl}/dashboard/vehicles/${vehicle._id}`,
      },
    });
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(user, subscription) {
    return await this.send({
      to: user.email,
      subject: `Subscription Confirmation - ${subscription.plan}`,
      template: 'subscription-confirmation',
      data: {
        name: user.name,
        plan: subscription.plan,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.currentPeriodEnd,
        manageUrl: `${config.frontendUrl}/dashboard/subscription`,
      },
    });
  }

  /**
   * Send subscription cancellation
   */
  async sendSubscriptionCancellation(user, subscription) {
    return await this.send({
      to: user.email,
      subject: 'Subscription Cancelled - EkA-Ai',
      template: 'subscription-cancellation',
      data: {
        name: user.name,
        plan: subscription.plan,
        endDate: subscription.currentPeriodEnd,
        resubscribeUrl: `${config.frontendUrl}/pricing`,
      },
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(user, invoice) {
    return await this.send({
      to: user.email,
      subject: 'Payment Failed - EkA-Ai',
      template: 'payment-failed',
      data: {
        name: user.name,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        invoiceNumber: invoice.invoiceNumber,
        updatePaymentUrl: `${config.frontendUrl}/dashboard/billing`,
      },
    });
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(to, subject, html, attachments = []) {
    return await this.send({
      to,
      subject,
      html,
      attachments,
    });
  }

  /**
   * Verify email provider connectivity
   */
  async verifyConnection() {
    try {
      if (this.useSendGrid) {
        // SendGrid doesn't have a verify method, just check API key
        return { success: true, provider: 'sendgrid' };
      }

      if (this.transporter) {
        await this.transporter.verify();
        return { success: true, provider: 'smtp' };
      }

      return { success: false, message: 'No email provider configured' };
    } catch (error) {
      logger.error(`Email verification error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();

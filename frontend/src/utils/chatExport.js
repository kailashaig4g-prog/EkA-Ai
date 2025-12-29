/**
 * Chat Export Utilities
 * Export chat conversations as Markdown, JSON, or HTML
 */

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

/**
 * Export messages as Markdown
 */
export const exportAsMarkdown = (messages, metadata = {}) => {
  const lines = [];
  
  // Header
  lines.push('# Kailash AI Chat Export');
  lines.push('');
  lines.push(`**Date:** ${new Date().toLocaleDateString('en-IN')}`);
  if (metadata.vehicle) {
    lines.push(`**Vehicle:** ${metadata.vehicle}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  messages.forEach((msg) => {
    const role = msg.role === 'user' ? '💬 You' : '🤖 Kailash AI';
    const time = formatTimestamp(msg.timestamp);
    
    lines.push(`### ${role}`);
    lines.push(`*${time}*`);
    lines.push('');
    lines.push(msg.content);
    
    if (msg.imageUrl) {
      lines.push('');
      lines.push(`![Attached Image](${msg.imageUrl})`);
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  // Footer
  lines.push('');
  lines.push('*Exported from Kailash AI by Go4Garage*');
  
  return lines.join('\n');
};

/**
 * Export messages as JSON
 */
export const exportAsJSON = (messages, metadata = {}) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    metadata: {
      source: 'Kailash AI',
      organization: 'Go4Garage',
      ...metadata,
    },
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      imageUrl: msg.imageUrl || null,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Export messages as printable HTML
 */
export const exportAsHTML = (messages, metadata = {}) => {
  const messageHTML = messages
    .map((msg) => {
      const isUser = msg.role === 'user';
      const time = formatTimestamp(msg.timestamp);
      const image = msg.imageUrl
        ? `<img src="${msg.imageUrl}" alt="Attachment" style="max-width: 300px; border-radius: 8px; margin-top: 8px;" />`
        : '';

      return `
        <div style="margin-bottom: 20px; ${isUser ? 'text-align: right;' : ''}">
          <div style="display: inline-block; max-width: 80%; text-align: left; padding: 12px 16px; border-radius: 12px; ${isUser ? 'background: #f5f4f2;' : 'background: white;'}">
            <div style="font-weight: 600; color: ${isUser ? '#570683' : '#333'}; margin-bottom: 4px;">
              ${isUser ? 'You' : '🤖 Kailash AI'}
            </div>
            <div style="color: #666; font-size: 11px; margin-bottom: 8px;">${time}</div>
            <div style="white-space: pre-wrap; line-height: 1.6;">${msg.content}</div>
            ${image}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Kailash AI Chat Export</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #faf9f7;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #570683;
        }
        .header h1 {
          color: #570683;
          margin: 0;
        }
        .header p {
          color: #666;
          margin: 8px 0 0 0;
        }
        .metadata {
          background: white;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 Kailash AI</h1>
        <p>Chat Export</p>
      </div>
      
      <div class="metadata">
        <strong>Export Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
        ${metadata.vehicle ? `<strong>Vehicle:</strong> ${metadata.vehicle}<br>` : ''}
        <strong>Messages:</strong> ${messages.length}
      </div>
      
      <div class="messages">
        ${messageHTML}
      </div>
      
      <div class="footer">
        Exported from Kailash AI • Go4Garage Private Limited
      </div>
    </body>
    </html>
  `;
};

/**
 * Download content as a file
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Print HTML content
 */
export const printHTML = (htmlContent) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Export chat with selected format
 */
export const exportChat = (messages, format = 'markdown', metadata = {}) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (format) {
    case 'markdown': {
      const content = exportAsMarkdown(messages, metadata);
      downloadFile(content, `kailash-chat-${timestamp}.md`, 'text/markdown');
      break;
    }
    case 'json': {
      const content = exportAsJSON(messages, metadata);
      downloadFile(content, `kailash-chat-${timestamp}.json`, 'application/json');
      break;
    }
    case 'pdf': {
      const content = exportAsHTML(messages, metadata);
      printHTML(content);
      break;
    }
    default:
      console.error('Unknown export format:', format);
  }
};

export default {
  exportAsMarkdown,
  exportAsJSON,
  exportAsHTML,
  downloadFile,
  printHTML,
  exportChat,
};

/**
 * Web controller for serving task view pages
 */

const db = require('../utils/db');

/**
 * View task page (public, no auth required)
 * GET /t/:taskId
 */
const viewTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Fetch task from database
    const result = await db.query(
      'SELECT id, type, question, image_url, estimated_seconds, metadata FROM tasks WHERE id = $1 AND is_active = true',
      [taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Task Not Found - VibeCoin</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 3rem; margin: 0; }
            p { font-size: 1.2rem; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>Task not found or no longer available</p>
          </div>
        </body>
        </html>
      `);
    }

    const task = result.rows[0];

    // Parse options from metadata
    let options = [];
    if (task.metadata && task.metadata.options) {
      options = task.metadata.options;
    }

    // Render the task view HTML
    const html = renderTaskHTML(task, options);
    res.send(html);

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - VibeCoin</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 { font-size: 2.5rem; margin: 0; }
          p { font-size: 1.2rem; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Oops!</h1>
          <p>Something went wrong loading this task</p>
        </div>
      </body>
      </html>
    `);
  }
};

/**
 * Render task HTML template
 */
function renderTaskHTML(task, options) {
  const isImageTask = task.image_url && task.image_url.trim() !== '';
  const isVideoTask = task.type && task.type.includes('video');

  // Build options list HTML
  let optionsHTML = '';
  if (options && options.length > 0) {
    optionsHTML = '<div class="options">';
    options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D...
      optionsHTML += `
        <div class="option">
          <span class="option-letter">${letter}</span>
          <span class="option-text">${escapeHtml(option)}</span>
        </div>
      `;
    });
    optionsHTML += '</div>';
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VibeCoin Task</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          color: #333;
        }

        .task-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          text-align: center;
        }

        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .header .subtitle {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .content {
          padding: 2rem;
        }

        .media-container {
          width: 100%;
          margin-bottom: 2rem;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .media-container img,
        .media-container video {
          width: 100%;
          height: auto;
          display: block;
          max-height: 500px;
          object-fit: contain;
        }

        .question {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .option {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          transition: all 0.2s;
        }

        .option:hover {
          border-color: #667eea;
          background: #f1f5ff;
          transform: translateX(4px);
        }

        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 0.9rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .option-text {
          font-size: 1rem;
          color: #2d3748;
          line-height: 1.5;
        }

        .footer {
          background: #f8f9fa;
          padding: 1.5rem 2rem;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }

        .footer-text {
          color: #718096;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }

        .footer-instruction {
          color: #4a5568;
          font-weight: 600;
          font-size: 1rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        @media (max-width: 640px) {
          body {
            padding: 1rem;
          }

          .content {
            padding: 1.5rem;
          }

          .header h1 {
            font-size: 1.25rem;
          }

          .question {
            font-size: 1.1rem;
          }

          .option {
            padding: 0.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="task-container">
        <div class="header">
          <h1>
            🪙 VibeCoin Task
            <span class="badge">~${task.estimated_seconds}s</span>
          </h1>
          <div class="subtitle">Review the task below and answer in your terminal</div>
        </div>

        <div class="content">
          ${isImageTask ? `
            <div class="media-container">
              <img src="${escapeHtml(task.image_url)}" alt="Task image" />
            </div>
          ` : ''}

          ${isVideoTask ? `
            <div class="media-container">
              <video controls autoplay loop>
                <source src="${escapeHtml(task.image_url)}" type="video/mp4">
                Your browser does not support video playback.
              </video>
            </div>
          ` : ''}

          <div class="question">
            ${escapeHtml(task.question)}
          </div>

          ${optionsHTML}
        </div>

        <div class="footer">
          <div class="footer-text">Answer this task to earn coins</div>
          <div class="footer-instruction">↩ Return to your terminal to submit your answer</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  viewTask
};

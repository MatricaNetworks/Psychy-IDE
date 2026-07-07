import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';

export class PsychyAIWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'psychy-ai-chat';
  private _view?: vscode.WebviewView;
  private socket?: Socket;

  constructor(private readonly _extensionUri: vscode.Uri, private readonly _userEmail: string) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtmlForWebview();

    this.setupSocketConnection();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          this.handleUserMessage(data.value);
          break;
        case 'approveCommand':
          this.socket?.emit('approval_response', { approved: data.value });
          break;
      }
    });
  }

  private setupSocketConnection() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('agent_status', (data) => {
      this._view?.webview.postMessage({ type: 'setStatus', content: data.message });
    });

    this.socket.on('agent_action', (data) => {
      this._view?.webview.postMessage({
        type: 'addMessage',
        role: 'system',
        content: '🛠️ Used tool: ' + data.tool
      });
    });

    this.socket.on('request_approval', (data) => {
      this._view?.webview.postMessage({ type: 'requestApproval', content: data.message, command: data.command });
    });

    this.socket.on('execution_complete', (data) => {
      this._view?.webview.postMessage({ type: 'setLoading', value: false });
      this._view?.webview.postMessage({
        type: 'addMessage',
        role: 'agent',
        content: data.success ? (data.result || 'Done.') : 'Error: ' + data.error
      });
    });
  }

  private handleUserMessage(prompt: string) {
    if (!this._view || !this.socket) return;

    this._view.webview.postMessage({ type: 'addMessage', role: 'user', content: prompt });
    this._view.webview.postMessage({ type: 'setLoading', value: true });

    const editor = vscode.window.activeTextEditor;
    const context = {
      activeFile: editor?.document.uri.fsPath,
      cursorPosition: editor ? { line: editor.selection.active.line, column: editor.selection.active.character } : undefined,
      workspaceRoot: vscode.workspace.workspaceFolders?.[0].uri.fsPath,
      userEmail: this._userEmail
    };

    this.socket.emit('execute', { prompt, context });
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: var(--vscode-font-family); padding: 10px; color: var(--vscode-editor-foreground); }
          .chat-container { display: flex; flex-direction: column; height: 95vh; }
          .messages { flex-grow: 1; overflow-y: auto; margin-bottom: 10px; display: flex; flex-direction: column; gap: 10px; }
          .message { padding: 8px 12px; border-radius: 6px; max-width: 90%; word-wrap: break-word; }
          .message.user { align-self: flex-end; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
          .message.agent { align-self: flex-start; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border); }
          .message.system { align-self: center; font-size: 0.85em; color: var(--vscode-descriptionForeground); font-style: italic; background: none; border: none; }
          .approval-box { background: var(--vscode-editorError-background); border: 1px solid var(--vscode-editorError-foreground); padding: 10px; border-radius: 6px; margin-top: 5px; }
          .approval-btn { margin-right: 5px; cursor: pointer; padding: 4px 8px; border: none; border-radius: 4px; }
          .approve { background: var(--vscode-testing-iconPassed); color: white; }
          .reject { background: var(--vscode-testing-iconFailed); color: white; }
          .input-container { display: flex; gap: 5px; }
          input { flex-grow: 1; padding: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
          button { padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
          .loader { display: none; font-size: 0.9em; color: var(--vscode-descriptionForeground); text-align: center; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="chat-container">
          <div class="messages" id="messages">
             <div class="message agent">Psychy-AI OS Active. Authenticated as: ${this._userEmail} 📧</div>
          </div>
          <div class="loader" id="loader">Agent is thinking...</div>
          <div class="input-container">
            <input type="text" id="prompt-input" placeholder="Give a command..." />
            <button id="send-btn">Send</button>
          </div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          const messagesDiv = document.getElementById('messages');
          const loader = document.getElementById('loader');

          document.getElementById('send-btn').addEventListener('click', () => {
            const val = document.getElementById('prompt-input').value.trim();
            if(val) { vscode.postMessage({ type: 'sendMessage', value: val }); document.getElementById('prompt-input').value = ''; }
          });

          window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'addMessage') {
              const div = document.createElement('div');
              div.className = 'message ' + msg.role;
              div.textContent = msg.content;
              messagesDiv.appendChild(div);
            } else if (msg.type === 'setStatus') {
              loader.textContent = msg.content;
            } else if (msg.type === 'setLoading') {
              loader.style.display = msg.value ? 'block' : 'none';
            } else if (msg.type === 'requestApproval') {
              const div = document.createElement('div');
              div.className = 'approval-box';
              div.innerHTML = '<p><strong>⚠️ Approval Required</strong><br/>' + msg.content + '</p>' +
                              '<code>' + msg.command + '</code><br/><br/>' +
                              '<button class="approval-btn approve" onclick="respond(true, this)">Approve</button>' +
                              '<button class="approval-btn reject" onclick="respond(false, this)">Reject</button>';
              messagesDiv.appendChild(div);
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          });

          window.respond = function(approved, btn) {
            vscode.postMessage({ type: 'approveCommand', value: approved });
            btn.parentElement.innerHTML = '<em>' + (approved ? '✅ Approved' : '❌ Rejected') + '</em>';
          }
        </script>
      </body>
      </html>`;
  }
}

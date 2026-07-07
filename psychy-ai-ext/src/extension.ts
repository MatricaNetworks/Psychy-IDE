import * as vscode from 'vscode';
import { PsychyAIWebviewProvider } from './webviewProvider';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Psychy AI OS Extension is attempting activation...');

  // 1. Gmail / Google Authentication Login Flow
  let session;
  try {
    session = await vscode.authentication.getSession('google', ['email', 'profile'], { createIfNone: true });
    vscode.window.showInformationMessage(`Psychy-AI: Logged in as ${session.account.label} (Gmail)`);
  } catch (error) {
    vscode.window.showErrorMessage('Psychy-AI: You must log in with your Gmail account to use this agent.');
    return; // Block execution until logged in
  }

  // 2. OpenRouter & Hugging Face API Keys
  let openRouterKey = await context.secrets.get('OPENROUTER_API_KEY');
  if (!openRouterKey) {
    openRouterKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenRouter API Key for API generation',
      ignoreFocusOut: true,
      password: true
    }) || '';
    if (openRouterKey) await context.secrets.store('OPENROUTER_API_KEY', openRouterKey);
  }

  let huggingFaceKey = await context.secrets.get('HUGGINGFACE_API_KEY');
  if (!huggingFaceKey) {
    huggingFaceKey = await vscode.window.showInputBox({
      prompt: 'Enter your Hugging Face API Key for API generation',
      ignoreFocusOut: true,
      password: true
    }) || '';
    if (huggingFaceKey) await context.secrets.store('HUGGINGFACE_API_KEY', huggingFaceKey);
  }

  // 3. Start the Extension
  const provider = new PsychyAIWebviewProvider(
    context.extensionUri, 
    session.account.label,
    openRouterKey,
    huggingFaceKey
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PsychyAIWebviewProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('psychyAi.start', () => {
      vscode.commands.executeCommand('workbench.view.extension.psychy-ai-explorer');
    })
  );
}

export function deactivate() {}

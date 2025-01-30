import * as vscode from 'vscode';
import { queryDeepseek } from "./deepseekClient";
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.askDeepseek', () => {
        const panel = vscode.window.createWebviewPanel(
			'deepseekChat',
			'Deepseek Chat',
			vscode.ViewColumn.One,
			{enableScripts: true}
		);

		// Buat URI untuk gambar lokal
		const userAvatar = panel.webview.asWebviewUri(vscode.Uri.file(
			context.extensionPath + '/src/assets/user.jpg'
		));
		const botAvatar = panel.webview.asWebviewUri(vscode.Uri.file(
			context.extensionPath + '/src/assets/bot.png'
		));
		panel.webview.html = getWebviewContent(context, botAvatar, userAvatar);
		panel.webview.html = getWebviewContent(context, botAvatar, userAvatar);

		panel.webview.onDidReceiveMessage(async message => {
			if (message.command === 'askDeepseek') {
				console.log('Query received:', message.text);
				const response = await queryDeepseek(message.text);
				console.log('AI Response:', response);
				panel.webview.postMessage({ command: 'reply', text: response });
			}
		});		
    });

    context.subscriptions.push(disposable);
}

export function getWebviewContent(context: vscode.ExtensionContext, botAvatar: vscode.Uri, userAvatar: vscode.Uri) {
    const filePath = vscode.Uri.file(
        path.join(context.extensionPath, 'src','webview.md')
    );

    const markdownContent =  fs.readFileSync(filePath.fsPath, 'utf8');

	const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deepseek Chat</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background:rgb(27, 26, 26);
            padding: 20px;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            width: 800px;
            height: 700px;
            background: rgb(76, 75, 75);
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .chat-box {
            height: 800px;
            overflow-y: auto;
            padding: 10px;
            display: flex;
            flex-direction: column;
        }
        .message {
            display: flex;
            align-items: flex-end;
            margin-bottom: 10px;
            max-width: 80%;
        }
        .message.user {
            flex-direction: row-reverse;
            align-self: flex-end;
        }
        .message.bot {
            align-self: flex-start;
        }
        .message .text {
            padding: 6px 9px;
            border-radius: 18px;
            font-size: 15px;
            max-width: 750px;
            word-wrap: break-word;
        }
        .message.user .text {
            background: #007aff;
            color: rgb(198, 197, 197);
        }
        .message.bot .text {
            background: rgb(198, 197, 197);
            color: black;
        }
        .message .avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin: 0 10px;
        }
        .message .timestamp {
            font-size: 10px;
            color: #888;
            margin-top: 3px;
        }
        .input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid rgb(76, 75, 75);
            background: rgb(76, 75, 75);
            
        }
        input {
            flex: 1;
            padding: 10px;
            border-style: inset;
            border-radius: 18px;
            border-color: rgb(103, 192, 255);
            background: #8a8484;
            font-size: 14px;
            outline: none;
        }
        button {
            background: #007aff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 18px;
            margin-left: 10px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #005bb5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="text-align: center;">Deepseek Chat</h2>
        <div class="chat-box" id="chat-box"></div>
        <div class="input-container">
            <input id="input" placeholder="Type your message..." />
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const userAvatar = "${userAvatar}";
        const botAvatar = "${botAvatar}";

        function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value.trim();
            if (!message) return;

            appendMessage("user", message);
            input.value = '';
            vscode.postMessage({ command: 'askDeepseek', text: message });
        }

        function appendMessage(sender, text) {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', sender);

            // Avatar
            const avatar = document.createElement('img');
            avatar.classList.add('avatar');
            avatar.src = sender === 'user' ? userAvatar : botAvatar;

            // Text Bubble
            const textBubble = document.createElement('div');
            textBubble.classList.add('text');
            textBubble.innerHTML = marked.parse(text);

            // Timestamp
            const timestamp = document.createElement('div');
            timestamp.classList.add('timestamp');
            timestamp.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Append Elements
            messageElement.appendChild(avatar);
            messageElement.appendChild(textBubble);
            messageElement.appendChild(timestamp);

            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'reply') {
                appendMessage('bot', message.text);
            }
        });
    </script>
</body>
</html>
`;

    return htmlContent;
}





// This method is called when your extension is deactivated
export function deactivate() {}

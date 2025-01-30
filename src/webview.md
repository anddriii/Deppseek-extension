<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deepseek Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #1e1e1e;
            color: #ddd;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: auto;
        }
        .chat-box {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #444;
            padding: 10px;
            background: #252526;
            border-radius: 8px;
        }
        .message {
            margin: 8px 0;
            padding: 10px;
            border-radius: 6px;
            max-width: 80%;
            word-wrap: break-word;
            white-space: pre-line;
        }
        .user {
            background: #007acc;
            color: white;
            text-align: right;
        }
        .bot {
            background: #3a3a3a;
            color: #ddd;
            text-align: left;
        }
        .input-container {
            display: flex;
            margin-top: 10px;
        }
        textarea {
            flex: 1;
            padding: 10px;
            border: 1px solid #666;
            border-radius: 4px;
            background: #2c2c2c;
            color: white;
            resize: vertical;
            min-height: 50px;
            max-height: 200px;
            font-size: 14px;
        }
        button {
            padding: 8px;
            margin-left: 5px;
            background: #007acc;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background: #005f99;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Deepseek AI Chat</h2>
        <div class="chat-box" id="chat-box"></div>
        <div class="input-container">
            <textarea id="input" placeholder="Type a message..." rows="3"></textarea>
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value.trim();
            if (!message) return;

            appendMessage("user", message);
            input.value = '';
            input.style.height = "auto"; 
            vscode.postMessage({ command: 'askDeepseek', text: message });
        }

        function appendMessage(sender, text) {
            const chatBox = document.getElementById('chat-box');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', sender);
            messageElement.innerHTML = formatText(text);
            chatBox.appendChild(messageElement);
            setTimeout(() => {
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 100);
        }

        function formatText(text) {
            // Convert **bold** text
            text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            // Add numbering for bot response
            if (text.includes('\n')) {
                const lines = text.split('\n');
                return lines.map((line, index) => `${index + 1}. ${line}`).join('<br>');
            }
            return text;
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
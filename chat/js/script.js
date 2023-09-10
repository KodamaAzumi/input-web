// チャットを入力する
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('input-message');
const sendButton = document.getElementById('send-button');

const sendMessage = () => {
  const messageText = messageInput.value;
  if (messageText.trim() !== '') {
    const messageElement = document.createElement('div');
    messageElement.classList.add(
      'message',
      'bg-white',
      'rounded-t-md',
      'rounded-bl-md',
      'p-2',
      'pr-3',
      'mb-3',
      'mr-2'
    );
    messageElement.textContent = messageText;
    chatMessages.appendChild(messageElement);
    messageInput.value = '';
    messageInput.style.height = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});

// 入力エリアの高さをスクロールの高さと合わせる。
const inputText = (textarea) => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

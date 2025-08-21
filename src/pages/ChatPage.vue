<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Чат - {{ username }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout" fill="clear">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Connection status indicator -->
      <div v-if="!connectionState.isConnected" class="connection-banner">
        <ion-text :color="getConnectionColor()">
          <div class="connection-status">
            <ion-spinner v-if="connectionState.status === 'connecting' || connectionState.status === 'reconnecting'" 
                        name="crescent" size="small"></ion-spinner>
            <ion-icon v-else :icon="getConnectionIcon()"></ion-icon>
            <span>{{ getConnectionMessage() }}</span>
          </div>
        </ion-text>
      </div>

      <!-- Messages list -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <ion-icon :icon="chatbubbleEllipsesOutline" size="large" color="medium"></ion-icon>
          <ion-text color="medium">
            <p>Пока нет сообщений. Начните общение!</p>
          </ion-text>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', { 'own-message': message.isOwnMessage }]"
        >
          <div class="message-bubble">
            <div class="message-header">
              <span class="sender-name">{{ message.sender }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Message input footer -->
    <ion-footer>
      <ion-toolbar>
        <form @submit.prevent="handleSendMessage" class="message-form">
          <ion-item lines="none" class="message-input-item">
            <ion-input
              v-model="newMessage"
              placeholder="Введите сообщение..."
              :disabled="!connectionState.isConnected || isSending"
              @keyup.enter="handleSendMessage"
              :maxlength="1000"
              class="message-input"
            ></ion-input>
            <ion-button
              slot="end"
              @click="handleSendMessage"
              :disabled="!newMessage.trim() || !connectionState.isConnected || isSending"
              fill="clear"
              class="send-button"
            >
              <ion-spinner v-if="isSending" name="crescent" size="small"></ion-spinner>
              <ion-icon v-else :icon="sendOutline"></ion-icon>
            </ion-button>
          </ion-item>
        </form>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonText,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue';
import {
  logOutOutline,
  sendOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircle,
  alertCircle,
  cloudOfflineOutline
} from 'ionicons/icons';
import { signalRService } from '../services/signalRService';

// Reactive state
const username = ref('');
const newMessage = ref('');
const isSending = ref(false);
const messagesContainer = ref<HTMLElement>();

// Computed properties
const messages = computed(() => signalRService.messages);
const connectionState = computed(() => signalRService.connectionState);

/**
 * Handle sending a new message
 */
const handleSendMessage = async (): Promise<void> => {
  if (!newMessage.value.trim() || !connectionState.value.isConnected || isSending.value) {
    return;
  }

  const messageContent = newMessage.value.trim();
  newMessage.value = '';
  isSending.value = true;

  try {
    await signalRService.sendMessage(messageContent);
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Show error toast
    const toast = await toastController.create({
      message: 'Не удалось отправить сообщение. Попробуйте снова.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    
    // Restore message content
    newMessage.value = messageContent;
  } finally {
    isSending.value = false;
  }
};

/**
 * Handle user logout
 */
const handleLogout = async (): Promise<void> => {
  const alert = await alertController.create({
    header: 'Выход из чата',
    message: 'Вы уверены, что хотите выйти из чата?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Выйти',
        role: 'destructive',
        handler: async () => {
          try {
            await signalRService.disconnect();
            localStorage.removeItem('chatUsername');
            window.location.href = '/login';
          } catch (error) {
            console.error('Error during logout:', error);
          }
        }
      }
    ]
  });

  await alert.present();
};

/**
 * Format timestamp for display
 */
const formatTime = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);
};

/**
 * Get connection status message
 */
const getConnectionMessage = (): string => {
  switch (connectionState.value.status) {
    case 'connecting':
      return 'Подключение...';
    case 'reconnecting':
      return 'Переподключение...';
    case 'failed':
      return connectionState.value.error || 'Ошибка подключения';
    case 'disconnected':
      return 'Нет подключения';
    default:
      return '';
  }
};

/**
 * Get connection status color
 */
const getConnectionColor = (): string => {
  switch (connectionState.value.status) {
    case 'connecting':
    case 'reconnecting':
      return 'warning';
    case 'failed':
    case 'disconnected':
      return 'danger';
    default:
      return 'medium';
  }
};

/**
 * Get connection status icon
 */
const getConnectionIcon = () => {
  switch (connectionState.value.status) {
    case 'connected':
      return checkmarkCircle;
    case 'failed':
      return alertCircle;
    case 'disconnected':
      return cloudOfflineOutline;
    default:
      return alertCircle;
  }
};

/**
 * Scroll to bottom of messages
 */
const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

/**
 * Check authentication and setup connection
 */
const initializeChat = async (): Promise<void> => {
  const savedUsername = localStorage.getItem('chatUsername');
  
  if (!savedUsername) {
    window.location.href = '/login';
    return;
  }

  username.value = savedUsername;

  // Connect to SignalR if not already connected
  if (!signalRService.isConnected) {
    try {
      await signalRService.connect(savedUsername);
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      const toast = await toastController.create({
        message: 'Не удалось подключиться к чату. Попробуйте войти заново.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      
      window.location.href = '/login';
    }
  }
};

// Watch for new messages and scroll to bottom
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  await initializeChat();
  await scrollToBottom();
});

onUnmounted(async () => {
  // Don't disconnect on unmount to maintain connection when navigating
  // Connection will be closed on logout or app close
});
</script>

<style scoped>
.connection-banner {
  background: var(--ion-color-light);
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.messages-container {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  opacity: 0.6;
}

.empty-chat ion-icon {
  margin-bottom: 1rem;
}

.message-item {
  margin-bottom: 1rem;
  display: flex;
}

.message-item:last-child {
  margin-bottom: 0;
}

.own-message {
  justify-content: flex-end;
}

.own-message .message-bubble {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  margin-left: 2rem;
}

.message-bubble {
  background: var(--ion-color-light);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  max-width: 80%;
  margin-right: 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.sender-name {
  font-weight: 600;
}

.message-time {
  font-size: 0.7rem;
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.message-form {
  width: 100%;
}

.message-input-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
}

.message-input {
  --padding-start: 1rem;
  --padding-end: 0.5rem;
}

.send-button {
  --padding-start: 0.5rem;
  --padding-end: 1rem;
  margin: 0;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .connection-banner {
    background: var(--ion-color-step-50);
    border-bottom-color: var(--ion-color-step-100);
  }

  .message-bubble {
    background: var(--ion-color-step-100);
    color: var(--ion-text-color);
  }

  .own-message .message-bubble {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
    margin-right: 1rem;
  }

  .own-message .message-bubble {
    margin-left: 1rem;
  }
}
</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Войти в чат</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="welcome-section">
          <h1>Добро пожаловать в чат</h1>
          <p>Введите ваш никнейм для начала общения</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <ion-item>
            <ion-label position="stacked">Никнейм</ion-label>
            <ion-input
              v-model="username"
              :clear-input="true"
              placeholder="Введите ваш никнейм"
              :maxlength="50"
              @ion-input="clearError"
              :class="{ 'ion-invalid': hasError }"
            ></ion-input>
          </ion-item>
          
          <ion-text v-if="errorMessage" color="danger" class="error-text">
            <p>{{ errorMessage }}</p>
          </ion-text>

          <ion-button
            expand="block"
            type="submit"
            :disabled="!username.trim() || isLoading"
            class="login-button"
          >
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Войти в чат</span>
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { signalRService } from '../services/signalRService';

// Reactive state
const username = ref('');
const errorMessage = ref('');
const hasError = ref(false);
const isLoading = ref(false);

/**
 * Handle form submission and login process
 */
const handleLogin = async (): Promise<void> => {
  if (!username.value.trim()) {
    showError('Пожалуйста, введите никнейм');
    return;
  }

  if (username.value.trim().length < 2) {
    showError('Никнейм должен содержать минимум 2 символа');
    return;
  }

  if (username.value.trim().length > 50) {
    showError('Никнейм не должен превышать 50 символов');
    return;
  }

  isLoading.value = true;
  clearError();

  try {
    // Save username to localStorage
    localStorage.setItem('chatUsername', username.value.trim());
    
    // Connect to SignalR
    await signalRService.connect(username.value.trim());
    
    // Show success toast
    const toast = await toastController.create({
      message: 'Успешно подключен к чату!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Простое перенаправление через изменение URL
    window.location.href = '/chat';
    
  } catch (error) {
    console.error('Login error:', error);
    showError(
      error instanceof Error 
        ? `Ошибка подключения: ${error.message}` 
        : 'Не удалось подключиться к чату. Попробуйте снова.'
    );
  } finally {
    isLoading.value = false;
  }
};

/**
 * Show error message
 */
const showError = (message: string): void => {
  errorMessage.value = message;
  hasError.value = true;
};

/**
 * Clear error state
 */
const clearError = (): void => {
  errorMessage.value = '';
  hasError.value = false;
};

/**
 * Check if user is already logged in on component mount
 */
onMounted(() => {
  const savedUsername = localStorage.getItem('chatUsername');
  if (savedUsername && signalRService.isConnected) {
    // User is already logged in, redirect to chat
    window.location.href = '/chat';
  } else if (savedUsername) {
    // Pre-fill username from localStorage
    username.value = savedUsername;
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section ion-icon {
  margin-bottom: 1rem;
}

.welcome-section h1 {
  margin: 1rem 0 0.5rem 0;
  font-size: 2rem;
  font-weight: bold;
}

.welcome-section p {
  margin: 0;
  opacity: 0.7;
  font-size: 1rem;
}

.login-form {
  width: 100%;
  margin-bottom: 2rem;
}

.login-button {
  margin-top: 1.5rem;
  height: 48px;
  font-weight: 600;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.info-section {
  text-align: center;
  margin-top: auto;
}

.info-section p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.875rem;
}

.info-section ion-icon {
  font-size: 1rem;
}

/* Input validation styles */
ion-input.ion-invalid {
  --border-color: var(--ion-color-danger);
  --highlight-color: var(--ion-color-danger);
}

/* Responsive design */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .welcome-section h1 {
    font-size: 1.5rem;
  }
}
</style>

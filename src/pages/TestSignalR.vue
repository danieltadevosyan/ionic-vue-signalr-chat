<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Тест SignalR</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div>
        <h1>Тест подключения SignalR</h1>
        
        <ion-button @click="testConnection" :disabled="isConnecting">
          <ion-spinner v-if="isConnecting" name="crescent" size="small"></ion-spinner>
          <span v-else>Тест подключения</span>
        </ion-button>
        
        <div v-if="status" :class="['status', statusClass]">
          {{ status }}
        </div>
        
        <div v-if="error" class="error">
          Ошибка: {{ error }}
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSpinner
} from '@ionic/vue';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const isConnecting = ref(false);
const status = ref('');
const error = ref('');
const statusClass = ref('');

const testConnection = async () => {
  isConnecting.value = true;
  status.value = 'Подключение...';
  statusClass.value = 'connecting';
  error.value = '';

  try {
    console.log('Creating connection...');
    const connection = new HubConnectionBuilder()
      .withUrl('/messenger/hub')
      .configureLogging(LogLevel.Information)
      .build();

    console.log('Starting connection...');
    await connection.start();
    
    status.value = 'Подключено успешно!';
    statusClass.value = 'success';
    console.log('Connected successfully');
    
    // Остановим соединение
    await connection.stop();
    
  } catch (err) {
    console.error('Connection failed:', err);
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка';
    status.value = 'Подключение не удалось';
    statusClass.value = 'error';
  } finally {
    isConnecting.value = false;
  }
};
</script>

<style scoped>
.status {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.status.connecting {
  background: #ffc409;
  color: #000;
}

.status.success {
  background: #2dd36f;
  color: #fff;
}

.status.error {
  background: #eb445a;
  color: #fff;
}

.error {
  margin-top: 1rem;
  padding: 1rem;
  background: #eb445a;
  color: #fff;
  border-radius: 8px;
}
</style>

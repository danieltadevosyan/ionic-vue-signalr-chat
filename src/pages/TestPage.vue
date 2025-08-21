<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Тест</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <h1>Приложение работает!</h1>
      <ion-button @click="goToLogin">Перейти к логину</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/vue';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};
</script>

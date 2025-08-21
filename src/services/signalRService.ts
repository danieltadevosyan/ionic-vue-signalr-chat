import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { reactive } from 'vue';
import type { ChatMessage, ConnectionState } from '../types';

/**
 * SignalR service for real-time chat communication
 * Manages connection to Azure SignalR Service and message handling
 */
class SignalRService {
  private connection: HubConnection | null = null;
  private readonly hubUrl = '/messenger/hub'; // Используем прокси Vite
  
  /** Reactive connection state */
  public readonly connectionState = reactive<ConnectionState>({
    isConnected: false,
    status: 'disconnected'
  });

  /** Reactive array of chat messages */
  public readonly messages = reactive<ChatMessage[]>([]);

  /** Current user's username */
  private currentUsername = '';

  /**
   * Initialize SignalR connection
   * @param username - Current user's username
   */
  public async connect(username: string): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    this.currentUsername = username;
    this.connectionState.status = 'connecting';

    try {
      // Build SignalR connection
      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents,
          timeout: 30000 // 30 секунд timeout
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000]) // Automatic reconnection intervals
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection with timeout
      const connectPromise = this.connection.start();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      
      this.connectionState.isConnected = true;
      this.connectionState.status = 'connected';
      this.connectionState.error = undefined;

      console.log('SignalR Connected to:', this.hubUrl);
    } catch (error) {
      this.connectionState.isConnected = false;
      this.connectionState.status = 'failed';
      this.connectionState.error = error instanceof Error ? error.message : 'Connection failed';
      console.error('SignalR Connection Error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  public async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
        this.connectionState.isConnected = false;
        this.connectionState.status = 'disconnected';
        this.connectionState.error = undefined;
      }
    }
  }

  /**
   * Send a message to the chat
   * @param content - Message content to send
   */
  public async sendMessage(content: string): Promise<void> {
    if (!this.connection || !this.connectionState.isConnected) {
      throw new Error('Not connected to SignalR hub');
    }

    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      // Send message through SignalR hub
      await this.connection.invoke('SendMessage', this.currentUsername, content.trim());
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Handle incoming messages
    this.connection.on('ReceiveMessage', (sender: string, content: string, timestamp?: string) => {
      const message: ChatMessage = {
        id: this.generateMessageId(),
        sender,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        isOwnMessage: sender === this.currentUsername
      };
      
      this.messages.push(message);
      console.log('Message received:', message);
    });

    // Handle connection events
    this.connection.onreconnecting(() => {
      this.connectionState.status = 'reconnecting';
      this.connectionState.isConnected = false;
      console.log('SignalR Reconnecting...');
    });

    this.connection.onreconnected(() => {
      this.connectionState.status = 'connected';
      this.connectionState.isConnected = true;
      this.connectionState.error = undefined;
      console.log('SignalR Reconnected');
    });

    this.connection.onclose((error) => {
      this.connectionState.status = 'disconnected';
      this.connectionState.isConnected = false;
      if (error) {
        this.connectionState.error = error.message;
        console.error('SignalR Connection closed with error:', error);
      } else {
        console.log('SignalR Connection closed');
      }
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all messages (for testing purposes)
   */
  public clearMessages(): void {
    this.messages.splice(0, this.messages.length);
  }

  /**
   * Get current connection status
   */
  public get isConnected(): boolean {
    return this.connectionState.isConnected;
  }
}

// Export singleton instance
export const signalRService = new SignalRService();

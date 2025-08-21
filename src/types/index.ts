/**
 * Interface for a chat message
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Username of the sender */
  sender: string;
  /** Message content */
  content: string;
  /** Timestamp when the message was sent */
  timestamp: Date;
  /** Whether the message was sent by the current user */
  isOwnMessage?: boolean;
}

/**
 * Interface for SignalR connection state
 */
export interface ConnectionState {
  /** Whether the connection is established */
  isConnected: boolean;
  /** Current connection status */
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';
  /** Error message if connection failed */
  error?: string;
}

/**
 * Interface for user information
 */
export interface User {
  /** Username/nickname */
  username: string;
}

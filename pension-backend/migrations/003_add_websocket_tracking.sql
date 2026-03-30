-- Migration: Add WebSocket Tracking
-- Created: 2026-03-30
-- Description: Add tracking for WebSocket connections and real-time features

-- Add table to track active WebSocket connections (optional, for monitoring)
CREATE TABLE IF NOT EXISTS websocket_connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    socket_id VARCHAR(255) NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('active', 'disconnected') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add indexes for WebSocket tracking
CREATE INDEX IF NOT EXISTS idx_websocket_connections_user_id ON websocket_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_status ON websocket_connections(status);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_connected_at ON websocket_connections(connected_at);

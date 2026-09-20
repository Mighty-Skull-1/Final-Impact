// Final Impact - Real-time Peer-to-Peer Netplay Engine
// Built on WebRTC DataChannels with zero-dependency backend signaling

export class Netplay {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'HOSTING' | 'CONNECTING' | 'CONNECTED'
    this.statusMessage = '';
    this.ping = 0;
    this.lastPingSent = 0;
    this.pingInterval = null;

    // Remote input buffer & latest snapshot
    this.remoteInputState = {};
    this.latestSnapshot = null;

    // Event listeners
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
    this.onMessageCallbacks = [];
  }

  get isConnected() {
    return this.status === 'CONNECTED' && this.conn && this.conn.open;
  }

  generateRoomCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  onConnect(cb) {
    this.onConnectCallbacks.push(cb);
  }

  onDisconnect(cb) {
    this.onDisconnectCallbacks.push(cb);
  }

  onMessage(cb) {
    this.onMessageCallbacks.push(cb);
  }

  hostMatch(customCode = null) {
    this.disconnect();
    this.isHost = true;
    this.roomCode = customCode || this.generateRoomCode();
    this.status = 'HOSTING';
    this.statusMessage = 'REGISTERING ROOM...';

    if (typeof window === 'undefined' || !window.Peer) {
      this.statusMessage = 'PEERJS NOT LOADED';
      console.warn('PeerJS library not loaded. Check internet connection or CDN.');
      return;
    }

    try {
      const peerId = `final-impact-room-${this.roomCode}`;
      this.peer = new window.Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.status = 'HOSTING';
        this.statusMessage = 'WAITING FOR CHALLENGER...';
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Host Peer error:', err);
        if (err.type === 'unavailable-id') {
          // Retry with new room code if collision occurred
          this.hostMatch();
        } else {
          this.statusMessage = `ERROR: ${err.type || 'SIGNALING FAILED'}`;
        }
      });
    } catch (e) {
      console.error('Failed to instantiate Peer:', e);
      this.statusMessage = 'NETPLAY INITIALIZATION FAILED';
    }
  }

  joinMatch(code) {
    if (!code) return;
    this.disconnect();
    this.isHost = false;
    const cleanCode = code.toString().trim().replace(/^IMP-/i, '').replace(/[^0-9a-zA-Z]/g, '');
    this.roomCode = cleanCode;
    this.status = 'CONNECTING';
    this.statusMessage = 'CONNECTING TO HOST...';

    if (typeof window === 'undefined' || !window.Peer) {
      this.statusMessage = 'PEERJS NOT LOADED';
      return;
    }

    try {
      this.peer = new window.Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        const targetId = `final-impact-room-${cleanCode}`;
        const conn = this.peer.connect(targetId, {
          reliable: true,
          serialization: 'json'
        });
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Join Peer error:', err);
        this.statusMessage = `ROOM NOT FOUND (${cleanCode})`;
      });
    } catch (e) {
      console.error('Failed to connect:', e);
      this.statusMessage = 'CONNECTION ATTEMPT FAILED';
    }
  }

  setupConnection(conn) {
    this.conn = conn;

    conn.on('open', () => {
      this.status = 'CONNECTED';
      this.statusMessage = 'CHALLENGER CONNECTED!';
      this.startPingTracker();
      this.onConnectCallbacks.forEach(cb => cb(this.isHost));
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    conn.on('close', () => {
      this.status = 'DISCONNECTED';
      this.statusMessage = 'CONNECTION CLOSED';
      this.stopPingTracker();
      this.onDisconnectCallbacks.forEach(cb => cb());
    });

    conn.on('error', (err) => {
      console.error('Data connection error:', err);
      this.statusMessage = 'CONNECTION ERROR';
    });
  }

  handleIncomingData(data) {
    if (!data || !data.type) return;

    if (data.type === 'PING') {
      this.send({ type: 'PONG', t: data.t });
      return;
    }

    if (data.type === 'PONG') {
      const rtt = Date.now() - data.t;
      this.ping = Math.max(1, Math.round(rtt / 2));
      return;
    }

    if (data.type === 'INPUT') {
      this.remoteInputState = data.inputs || {};
    } else if (data.type === 'SNAPSHOT') {
      this.latestSnapshot = data;
    }

    // Forward to any custom subscribers
    this.onMessageCallbacks.forEach(cb => cb(data));
  }

  send(data) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(data);
      } catch (err) {
        console.warn('Failed to send packet:', err);
      }
    }
  }

  sendInput(inputState) {
    this.send({
      type: 'INPUT',
      inputs: inputState
    });
  }

  sendSnapshot(snapshot) {
    this.send({
      type: 'SNAPSHOT',
      ...snapshot
    });
  }

  sendRematchVote(vote) {
    this.send({
      type: 'REMATCH_VOTE',
      vote
    });
  }

  startPingTracker() {
    this.stopPingTracker();
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'PING', t: Date.now() });
      }
    }, 1000);
  }

  stopPingTracker() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    this.stopPingTracker();
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.status = 'DISCONNECTED';
    this.statusMessage = '';
    this.roomCode = null;
    this.remoteInputState = {};
    this.latestSnapshot = null;
  }
}

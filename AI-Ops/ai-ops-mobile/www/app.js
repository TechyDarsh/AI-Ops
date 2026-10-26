const SERVER_IP = "10.33.140.180";
const SERVER_PORT = "8081";

let isSosActive = false;
let vibrateInterval = null;

function triggerContinuousVibration() {
  // Clear any existing timer
  if (vibrateInterval) clearInterval(vibrateInterval);

  const pulseVibrate = () => {
    if (!isSosActive) {
      if (vibrateInterval) clearInterval(vibrateInterval);
      return;
    }
    // Web Vibration API
    if (navigator.vibrate) {
      navigator.vibrate([1000, 200, 1000, 200, 1000]);
    }
    // Capacitor Native Vibration if in APK wrapper
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
      window.Capacitor.Plugins.Haptics.vibrate({ duration: 1000 });
    }
  };

  pulseVibrate();
  vibrateInterval = setInterval(pulseVibrate, 1500);
}

function stopContinuousVibration() {
  if (vibrateInterval) {
    clearInterval(vibrateInterval);
    vibrateInterval = null;
  }
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
}

// Windows Error Dialog functions
window.handleCalibrate = function(e) {
  if (e) e.stopPropagation();
  
  // 1. Send WebSocket event to Python Gateway to broadcast to PC browser on port 6000
  if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
    socketInstance.send(JSON.stringify({
      action: "CALIBRATE_ALERT",
      machineId: "MACHINE-002",
      message: "Immediate action required to Machine 2 (M12)!"
    }));
  }

  // 2. Trigger high-intensity vibration immediately on mobile
  if (navigator.vibrate) {
    navigator.vibrate([800, 150, 800, 150, 800]);
  }
};

window.closeWinModal = function() {
  const modal = document.getElementById('win-error-modal');
  if (modal) modal.classList.remove('active');
};

let socketInstance = null;

function connectWebSocket() {
  const ws = new WebSocket(`ws://${SERVER_IP}:${SERVER_PORT}`);
  socketInstance = ws;
  const connStatus = document.getElementById('conn-status');

  ws.onopen = () => {
    connStatus.textContent = 'ONLINE';
    connStatus.className = 'status-badge online';
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.status === 'OFFLINE') {
        setOffline();
        return;
      }
      if (data.dht22 && data.mq2 && data.mq9) {
        updateUI(data);
        checkAlarms(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  ws.onerror = (err) => {
    connStatus.textContent = 'ERROR (Check IP/Firewall)';
    connStatus.className = 'status-badge offline';
    console.error('WebSocket Error:', err);
  };

  ws.onclose = (event) => {
    connStatus.textContent = `CLOSED (${event.code})`;
    connStatus.className = 'status-badge offline';
    setTimeout(connectWebSocket, 3000);
  };
}

function setOffline() {
  const connStatus = document.getElementById('conn-status');
  connStatus.textContent = 'OFFLINE';
  connStatus.className = 'status-badge offline';
}

function updateUI(data) {
  // DHT22
  const t = data.dht22.temperature;
  const h = data.dht22.humidity;
  updateCard('mch001', 
    t > 40 ? 'critical' : t > 32 ? 'warning' : 'online',
    'val-temp', `${t.toFixed(1)} &deg;C`,
    'val-hum', `${h.toFixed(1)} %`,
    t > 40
  );

  // MQ-2
  const mq2r = data.mq2.raw;
  const mq2v = data.mq2.voltage;
  updateCard('mch002', 
    mq2r >= 130 ? 'critical' : mq2r > 100 ? 'warning' : 'online',
    'val-mq2-raw', mq2r,
    'val-mq2-volt', `${mq2v.toFixed(2)} V`,
    mq2r >= 130
  );

  // MQ-9
  const mq9r = data.mq9.raw;
  const mq9v = data.mq9.voltage;
  updateCard('mch003', 
    mq9r > 600 ? 'critical' : mq9r > 400 ? 'warning' : 'online',
    'val-mq9-raw', mq9r,
    'val-mq9-volt', `${mq9v.toFixed(2)} V`,
    mq9r > 600
  );
}

function updateCard(id, status, val1Id, val1Txt, val2Id, val2Txt, isCrit) {
  const card = document.getElementById(`card-${id}`);
  const statusEl = document.getElementById(`status-${id}`);
  const v1 = document.getElementById(val1Id);
  const v2 = document.getElementById(val2Id);

  card.className = `card ${status}`;
  statusEl.className = `mch-status ${status}`;
  statusEl.textContent = status.toUpperCase();

  v1.innerHTML = val1Txt;
  v1.className = `data-val ${isCrit ? 'critical' : ''}`;
  
  v2.innerHTML = val2Txt;
}

function checkAlarms(data) {
  if (data.mq2.raw >= 130) {
    if (!isSosActive) {
      isSosActive = true;
      triggerSOS();
    }
  } else {
    if (isSosActive) {
      isSosActive = false;
      stopContinuousVibration();
      const horn = document.getElementById('sos-horn');
      if (horn) horn.pause();
    }
  }
}

function triggerSOS() {
  // Heavy continuous vibration loop
  triggerContinuousVibration();
  
  // Play Loud Horn Sound
  const horn = document.getElementById('sos-horn');
  if (horn) {
    horn.currentTime = 0;
    horn.play().catch(e => console.log('Audio autoplay blocked', e));
  }
  
  // Show Native Android Notification via Capacitor
  if (window.Capacitor && Capacitor.Plugins.LocalNotifications) {
    Capacitor.Plugins.LocalNotifications.schedule({
      notifications: [{
        title: "🚨 SOS: CRITICAL GAS LEAK",
        body: "MQ-2 Raw has exceeded safe limits (>= 130). Evacuate immediately!",
        id: 1,
        schedule: { at: new Date(Date.now() + 1000) },
        actionTypeId: "",
        extra: null
      }]
    });
  } else if (Notification.permission === "granted") {
    new Notification("🚨 SOS: CRITICAL GAS LEAK", {
      body: "MQ-2 Raw has exceeded safe limits (>= 130). Evacuate immediately!"
    });
  }
}

// Request permissions on load
if (window.Capacitor && Capacitor.Plugins.LocalNotifications) {
  Capacitor.Plugins.LocalNotifications.requestPermissions();
}

// --- INTERACTIVE UI LOGIC ---

// Hamburger Menu
document.getElementById('menu-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('active');
  document.getElementById('sidebar-overlay').classList.add('active');
});

// Close Sidebar on Overlay Click
document.getElementById('sidebar-overlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebar-overlay').classList.remove('active');
});

// Toggle Card Details
window.toggleDetails = function(id) {
  const details = document.getElementById(`details-${id}`);
  if (details.classList.contains('active')) {
    details.classList.remove('active');
  } else {
    // Hide others
    document.querySelectorAll('.card-details').forEach(el => el.classList.remove('active'));
    details.classList.add('active');
  }
};

// Start
connectWebSocket();

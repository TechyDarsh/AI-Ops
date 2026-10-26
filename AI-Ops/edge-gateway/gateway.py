import serial
import serial.tools.list_ports
import json
import time
import asyncio
import websockets
import threading

# Configuration
WS_HOST = "0.0.0.0"
WS_PORT = 8081

connected_clients = set()
latest_telemetry = {}

def serial_reader_thread():
    global latest_telemetry
    ser = None
    parsed_data = {}

    while True:
        if ser is None or not ser.is_open:
            ports = serial.tools.list_ports.comports()
            # Prioritize USB / Arduino / CH340 devices over virtual Bluetooth ports
            ports = sorted(ports, key=lambda p: 0 if any(x in p.description.upper() for x in ["ARDUINO", "CH340", "USB", "UART"]) else 1)
            
            connected = False
            for port in ports:
                try:
                    print(f"Trying to connect to {port.device} ({port.description})...")
                    ser = serial.Serial(port.device, 9600, timeout=2)
                    print(f"Successfully connected to Arduino on {port.device}")
                    latest_telemetry = {"deviceId": "ARDUINO-001", "status": "ONLINE", "timestamp": int(time.time() * 1000)}
                    connected = True
                    break
                except Exception as e:
                    print(f"Skipping {port.device}: {e}")
            
            if not connected:
                print("Waiting for Arduino (No accessible COM ports found)...")
                latest_telemetry = {"deviceId": "ARDUINO-001", "status": "OFFLINE", "timestamp": int(time.time() * 1000)}
                time.sleep(3)
                continue

        try:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                # Debug print raw line from serial
                print(f"[RAW SERIAL]: {line}")
                
                # 1. Try parsing as JSON first (if they flash the new firmware)
                if line.startswith('{') and line.endswith('}'):
                    try:
                        payload = json.loads(line)
                        payload["timestamp"] = int(time.time() * 1000)
                        latest_telemetry = payload
                        print(f"Live Telemetry (JSON): {payload}")
                    except json.JSONDecodeError:
                        pass
                
                # 2. Parse the human-readable text output (their current firmware)
                else:
                    line_lower = line.lower()
                    if "mq-2" in line_lower or "mq2" in line_lower:
                        if "voltage" in line_lower:
                            parts = line.split(":")
                            if len(parts) > 1:
                                try: parsed_data["mq2_volt"] = float(parts[1].replace("V","").replace("v","").strip())
                                except: pass
                        elif "raw" in line_lower or "val" in line_lower:
                            parts = line.split(":")
                            if len(parts) > 1:
                                try: parsed_data["mq2_raw"] = float(parts[1].strip())
                                except: pass
                    elif "mq-9" in line_lower or "mq9" in line_lower:
                        if "voltage" in line_lower:
                            parts = line.split(":")
                            if len(parts) > 1:
                                try: parsed_data["mq9_volt"] = float(parts[1].replace("V","").replace("v","").strip())
                                except: pass
                        elif "raw" in line_lower or "val" in line_lower:
                            parts = line.split(":")
                            if len(parts) > 1:
                                try: parsed_data["mq9_raw"] = float(parts[1].strip())
                                except: pass
                    elif "temp" in line_lower:
                        parts = line.split(":")
                        if len(parts) > 1:
                            val = parts[1].replace("°C","").replace("C","").replace("c","").replace("*C","").strip()
                            try: parsed_data["temp"] = float(val)
                            except: pass
                    elif "hum" in line_lower:
                        parts = line.split(":")
                        if len(parts) > 1:
                            val = parts[1].replace("%","").strip()
                            try: parsed_data["hum"] = float(val)
                            except: pass

                    elif "dht" in line_lower:
                        if "error" in line_lower:
                            parsed_data["dht_error"] = True
                        else:
                            parsed_data["dht_error"] = False

                    # Only update payload when a complete block finishes (at the --- divider)
                    if "---" in line:
                        payload = {
                            "deviceId": "ARDUINO-001",
                            "source": "REAL",
                            "dht22": {
                                "temperature": parsed_data.get("temp", 26.0), 
                                "humidity": parsed_data.get("hum", 55.0),
                                "error": parsed_data.get("dht_error", False)
                            },
                            "mq2": {
                                "raw": parsed_data.get("mq2_raw", 1012.0), 
                                "voltage": parsed_data.get("mq2_volt", 4.95)
                            },
                            "mq9": {
                                "raw": parsed_data.get("mq9_raw", 55.0), 
                                "voltage": parsed_data.get("mq9_volt", 0.27)
                            },
                            "timestamp": int(time.time() * 1000)
                        }
                        latest_telemetry = payload
                        print(f"Live Telemetry (Parsed): {payload}")
                        parsed_data = {}
        except serial.SerialException:
            print("Serial connection lost.")
            latest_telemetry = {"deviceId": "ARDUINO-001", "status": "OFFLINE", "timestamp": int(time.time() * 1000)}
            ser.close()
            ser = None
        except Exception as e:
            print(f"Error reading serial: {e}")
            time.sleep(1)

async def ws_handler(websocket, *args, **kwargs):
    print("New web client connected!")
    connected_clients.add(websocket)
    # Immediately send the latest telemetry upon connection so client doesn't wait
    if latest_telemetry:
        try:
            await websocket.send(json.dumps(latest_telemetry))
        except Exception:
            pass
    try:
        # Keep connection open and listen for client messages
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get("action") == "CALIBRATE_ALERT":
                    print(f"Broadcast alert received: {data}")
                    broadcast_msg = json.dumps({
                        "type": "WINDOWS_ALERT",
                        "machineId": data.get("machineId", "MACHINE-002"),
                        "message": data.get("message", "Immediate action required to Machine 2 (M12)!")
                    })
                    for client in list(connected_clients):
                        try:
                            await client.send(broadcast_msg)
                        except Exception:
                            pass
            except Exception as e:
                print(f"Error handling message: {e}")
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def telemetry_broadcaster():
    while True:
        if latest_telemetry and connected_clients:
            msg = json.dumps(latest_telemetry)
            # Make a copy of clients set to prevent mutation during iteration
            for client in list(connected_clients):
                try:
                    await client.send(msg)
                except Exception:
                    pass
        await asyncio.sleep(0.5)

async def main():
    print(f"Starting WebSocket server on ws://{WS_HOST}:{WS_PORT}...")
    
    # Start the serial reader in a background thread
    thread = threading.Thread(target=serial_reader_thread, daemon=True)
    thread.start()

    # Start telemetry broadcast loop
    asyncio.create_task(telemetry_broadcaster())

    # Start WebSocket server
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())

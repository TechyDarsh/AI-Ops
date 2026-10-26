import serial
import serial.tools.list_ports
import time

print("="*50)
print("SCANNING AVAILABLE COM PORTS...")
print("="*50)
ports = list(serial.tools.list_ports.comports())
if not ports:
    print("NO COM PORTS DETECTED! Make sure the Arduino USB cable is firmly plugged in.")
else:
    for p in ports:
        print(f"-> Port: {p.device} | Description: {p.description}")

print("\nAttempting to connect and listen on each port...")
for p in ports:
    for baud in [9600, 115200]:
        try:
            print(f"\n[Testing {p.device} at {baud} baud...]")
            ser = serial.Serial(p.device, baud, timeout=3)
            print(f"Connected to {p.device}! Waiting 3 seconds for data...")
            start = time.time()
            data_received = False
            while time.time() - start < 4:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"SUCCESS! Received: {line}")
                    data_received = True
            ser.close()
            if not data_received:
                print(f"No incoming characters on {p.device} at {baud}.")
        except Exception as e:
            print(f"Could not open {p.device}: {e}")

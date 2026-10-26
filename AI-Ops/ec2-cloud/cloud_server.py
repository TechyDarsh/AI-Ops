import asyncio
import websockets

clients = set()
latest_data = '{"status": "AWAITING_DATA"}'

async def relay_handler(websocket, path):
    global latest_data
    clients.add(websocket)
    print(f"[+] Client connected. Total clients: {len(clients)}")
    
    # Send the last known state immediately so the app doesn't show blank
    try:
        await websocket.send(latest_data)
    except:
        pass

    try:
        # Listen for incoming data (from your PC agent)
        async for message in websocket:
            latest_data = message
            
            # Broadcast this data to every OTHER connected client (e.g. mobile apps)
            for client in list(clients):
                if client != websocket:
                    try:
                        await client.send(message)
                    except websockets.exceptions.ConnectionClosed:
                        clients.remove(client)
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        print(f"Error: {e}")
    finally:
        clients.remove(websocket)
        print(f"[-] Client disconnected. Total clients: {len(clients)}")

async def main():
    port = 8081
    print(f"Starting AWS EC2 WebSocket Relay Server on 0.0.0.0:{port}...")
    print("Waiting for PC Agent to send data...")
    # Bind to 0.0.0.0 to allow external connections
    async with websockets.serve(relay_handler, "0.0.0.0", port):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())

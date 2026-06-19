import asyncio
import websockets

async def test_ws():
    try:
        print("Connecting...")
        async with websockets.connect("ws://host.docker.internal:8000/ws") as ws:
            print("Connected!")
            # Wait for one message
            msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
            print("Received:", msg)
    except Exception as e:
        print("Failed:", repr(e))

asyncio.run(test_ws())

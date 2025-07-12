// Create this file: src/app/(dashboard)/test-websocket/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { socketManager } from "@/lib/socket";

export default function WebSocketTestPage() {
  const { data: session, status } = useSession();
  type ConnectionInfo = {
    socketConnected: boolean;
    socketId?: string;
    isConnected: boolean;
    socketUrl?: string;
    reconnectAttempts: number;
  };

  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    socketConnected: false,
    socketId: "",
    isConnected: false,
    socketUrl: "",
    reconnectAttempts: 0,
  });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [serverLogs, setServerLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const info = socketManager.getDebugInfo();
      setConnectionInfo(info);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTestResult = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    addTestResult("🔄 Starting WebSocket connection test...");

    // Check session data first
    if (!session) {
      addTestResult("❌ No session found! User needs to log in.");
      return;
    }

    addTestResult(`✅ Session found - User: ${session.user?.name}`);
    addTestResult(`✅ User ID: ${session.user?.id}`);
    addTestResult(
      `✅ Restaurant ID: ${session.user?.restaurantId || "MISSING!"}`
    );
    addTestResult(`✅ User Role: ${session.user?.role}`);

    if (!session.user?.restaurantId) {
      addTestResult(
        "❌ CRITICAL: No restaurantId in session! This will prevent WebSocket connection."
      );
      addTestResult(
        "💡 Check your login process and ensure restaurantId is being set correctly."
      );
      return;
    }

    try {
      addTestResult("🔌 Attempting to connect to WebSocket...");

      await socketManager.connect(
        session.user.restaurantId,
        session.user.id || "test-token"
      );

      addTestResult("✅ WebSocket connection successful!");

      // Test basic functionality
      setTimeout(() => {
        const isConnected = socketManager.isSocketConnected();
        addTestResult(
          `🔍 Connection verification: ${
            isConnected ? "CONNECTED" : "DISCONNECTED"
          }`
        );
      }, 2000);
    } catch (error) {
      addTestResult(`❌ WebSocket connection failed: ${error}`);
      addTestResult("💡 Check server logs for more details.");
    }
  };

  const testServerConnection = async () => {
    addTestResult("📡 Testing server connection...");

    try {
      const response = await fetch("http://localhost:3000/api/socket");
      const data = await response.json();

      if (response.ok) {
        addTestResult("✅ Server is reachable and Socket.IO is running");
        addTestResult(
          `📊 Connected clients: ${data.data?.connectedClients || 0}`
        );
        addTestResult(`⏰ Server time: ${data.data?.serverTime}`);
      } else {
        addTestResult("❌ Server responded with error");
      }
    } catch (error) {
      addTestResult(`❌ Cannot reach server: ${error}`);
      addTestResult("💡 Make sure server is running on port 3000");
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const disconnect = () => {
    socketManager.disconnect();
    addTestResult("🔌 Disconnected from WebSocket");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WebSocket Connection Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Debug */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Session Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span
                className={
                  status === "authenticated" ? "text-green-600" : "text-red-600"
                }
              >
                {status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User Name:</span>
              <span>{session?.user?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-xs">
                {session?.user?.id || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Restaurant ID:</span>
              <span
                className={`font-mono text-xs ${
                  session?.user?.restaurantId
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {session?.user?.restaurantId || "MISSING!"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User Role:</span>
              <span>{session?.user?.role || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">WebSocket Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Socket Connected:</span>
              <span
                className={
                  connectionInfo.socketConnected
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {connectionInfo.socketConnected ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Socket ID:</span>
              <span className="font-mono text-xs">
                {connectionInfo.socketId || "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Is Connected:</span>
              <span
                className={
                  connectionInfo.isConnected ? "text-green-600" : "text-red-600"
                }
              >
                {connectionInfo.isConnected ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Socket URL:</span>
              <span className="font-mono text-xs">
                {connectionInfo.socketUrl || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Reconnect Attempts:</span>
              <span>{connectionInfo.reconnectAttempts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mt-6 bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={testServerConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Server
          </button>
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!session?.user?.restaurantId}
          >
            Test WebSocket
          </button>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">
              No test results yet. Click "Test Server" first, then "Test
              WebSocket".
            </div>
          ) : (
            testResults.map((result, index) => <div key={index}>{result}</div>)
          )}
        </div>
      </div>

      {/* Raw Session Data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 bg-white border rounded p-2">
          Raw Session Data (Click to expand)
        </summary>
        <pre className="text-xs bg-gray-100 p-4 rounded mt-2 overflow-auto border">
          {JSON.stringify(session, null, 2)}
        </pre>
      </details>

      {/* Connection Info */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 bg-white border rounded p-2">
          Raw Connection Info (Click to expand)
        </summary>
        <pre className="text-xs bg-gray-100 p-4 rounded mt-2 overflow-auto border">
          {JSON.stringify(connectionInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

export default function Home() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const previousUsersRef = useRef([]);

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("monaco");

  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [connected, setConnected] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => {
    return ydoc.getText("monaco");
  }, [ydoc]);

  useEffect(() => {
    const savedUsername =
      new URLSearchParams(window.location.search).get("username");

    const savedRoom =
      new URLSearchParams(window.location.search).get("room");

    if (savedUsername) {
      setUsername(savedUsername);
      setJoined(true);
    }

    if (savedRoom) {
      setRoomId(savedRoom);
    }
  }, []);

  useEffect(() => {
    if (!joined || !username) return;

    const provider = new SocketIOProvider(
      "/",
      roomId,
      ydoc,
      {
        autoConnect: true,
      }
    );

    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      id: provider.awareness.clientID,
      username,
    });

    const updateUsers = () => {
      const states = Array.from(
        provider.awareness.getStates().values()
      );

      const onlineUsers = states
        .filter((state) => state?.user)
        .map((state) => state.user);

      const previousUsers = previousUsersRef.current;

      onlineUsers.forEach((user) => {
        const existed = previousUsers.find(
          (u) => u.id === user.id
        );

        if (!existed) {
          setNotifications((prev) => [
            {
              id: Date.now() + Math.random(),
              text: `${user.username} joined`,
            },
            ...prev.slice(0, 4),
          ]);
        }
      });

      previousUsers.forEach((user) => {
        const stillExists = onlineUsers.find(
          (u) => u.id === user.id
        );

        if (!stillExists) {
          setNotifications((prev) => [
            {
              id: Date.now() + Math.random(),
              text: `${user.username} left`,
            },
            ...prev.slice(0, 4),
          ]);
        }
      });

      previousUsersRef.current = onlineUsers;
      setUsers(onlineUsers);
    };

    provider.awareness.on("change", updateUsers);

    provider.on("status", ({ status }) => {
      setConnected(status === "connected");
    });

    updateUsers();

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField(
        "user",
        null
      );
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      provider.awareness.setLocalStateField(
        "user",
        null
      );

      provider.awareness.off(
        "change",
        updateUsers
      );

      provider.disconnect();

      bindingRef.current?.destroy();

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [joined, username, roomId, ydoc]);

  const handleMount = async (editor) => {
    editorRef.current = editor;

    const { MonacoBinding } = await import(
      "y-monaco"
    );

    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor])
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();

    const name = e.target.username.value.trim();
    const room = e.target.room.value.trim();

    if (!name || !room) return;

    setUsername(name);
    setRoomId(room);
    setJoined(true);

    window.history.pushState(
      {},
      "",
      `?username=${encodeURIComponent(
        name
      )}&room=${encodeURIComponent(room)}`
    );
  };

  const handleLeave = () => {
    providerRef.current?.awareness.setLocalStateField(
      "user",
      null
    );

    providerRef.current?.disconnect();

    bindingRef.current?.destroy();

    setJoined(false);
    setUsers([]);
    setNotifications([]);

    window.history.pushState({}, "", "/");
  };

  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(roomId);

      setNotifications((prev) => [
        {
          id: Date.now(),
          text: "Room ID copied",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  if (!joined) {
    return (
      <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full" />

        <form
          onSubmit={handleJoin}
          className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            NexCode
          </h1>

          <p className="text-zinc-400 mb-8">
            Real-Time Collaborative Editor
          </p>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full mb-4 px-4 py-3 rounded-xl bg-zinc-900 text-white border border-zinc-800 outline-none"
          />

          <input
            type="text"
            name="room"
            defaultValue="monaco"
            placeholder="Room ID"
            className="w-full mb-6 px-4 py-3 rounded-xl bg-zinc-900 text-white border border-zinc-800 outline-none"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Join Workspace
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen bg-black flex p-4 gap-4">
      {/* Sidebar */}
      <aside className="w-80 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            Workspace
          </h2>

          <p className="text-zinc-400 text-sm">
            {users.length} online
          </p>

          <div className="mt-3 text-xs text-zinc-500">
            Room: {roomId}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-zinc-400 text-sm mb-3">
            Members
          </h3>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-zinc-800 p-3 rounded-xl"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {user.username
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800" />
                </div>

                <div>
                  <p className="text-white font-medium">
                    {user.username}
                  </p>

                  <p className="text-xs text-zinc-400">
                    Online
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-zinc-400 text-sm mb-3">
              Activity
            </h3>

            <div className="space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-800 p-2 rounded-lg text-xs text-zinc-300"
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Editor Area */}
      <section className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                connected
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-white text-sm">
              {connected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              className="bg-zinc-800 text-white px-3 py-2 rounded-lg"
            >
              <option value="javascript">
                JavaScript
              </option>
              <option value="typescript">
                TypeScript
              </option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <button
              onClick={copyRoom}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg"
            >
              Copy Room
            </button>

            <button
              onClick={handleLeave}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            defaultValue="// Start collaborating..."
            onMount={handleMount}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 15,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: {
                top: 16,
              },
            }}
          />
        </div>
      </section>
    </main>
  );
}
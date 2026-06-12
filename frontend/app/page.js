"use client";

import { useRef, useMemo } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

export default function Home() {

  const editorRef = useRef(null)

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc], {
    autoConnect: true,
  })

  const handleMount = async (editor) => {
    editorRef.current = editor

    const { MonacoBinding } = await import("y-monaco");

    const provider = new SocketIOProvider("http://localhost:8000", "monaco", ydoc, {
      autoConnect: true
    });

    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">

      {/* Sidebar */}
      <aside className="w-1/4 bg-amber-100 rounded-lg"></aside>

      {/* Editor */}
      <section className="flex-1 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
          onMount={handleMount}
        />
      </section>

    </main>
  );
}

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useCallback, useRef } from 'react'

interface RichEditorProps {
  content:    string
  onChange:   (html: string) => void
  placeholder?: string
  editable?:  boolean
}

export function RichEditor({ content, onChange, placeholder = 'Start writing your meeting notes…', editable = true }: RichEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList:  { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content:  content || '',
    editable,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML())
    },
  })

  // Sync external content changes (e.g. switching pages)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  if (!editor) return null

  const ToolBtn = ({
    active, onClick, title, children,
  }: {
    active?: boolean; onClick: () => void; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        padding: '4px 8px',
        borderRadius: 5,
        border: active ? '1.5px solid #0f766e' : '1px solid transparent',
        background: active ? '#f0fdfa' : 'transparent',
        color: active ? '#0f766e' : '#475569',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: 'pointer',
        minWidth: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.12s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = '#f1f5f9'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )

  const Divider = () => (
    <span style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      {editable && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          background: '#fafafa',
          flexShrink: 0,
        }}>
          {/* History */}
          <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
          <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
          <Divider />

          {/* Headings */}
          <ToolBtn
            title="Heading 1"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >H1</ToolBtn>
          <ToolBtn
            title="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >H2</ToolBtn>
          <ToolBtn
            title="Heading 3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >H3</ToolBtn>
          <Divider />

          {/* Inline formatting */}
          <ToolBtn
            title="Bold"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          ><strong>B</strong></ToolBtn>
          <ToolBtn
            title="Italic"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          ><em>I</em></ToolBtn>
          <ToolBtn
            title="Underline"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          ><span style={{ textDecoration: 'underline' }}>U</span></ToolBtn>
          <ToolBtn
            title="Strikethrough"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          ><span style={{ textDecoration: 'line-through' }}>S</span></ToolBtn>
          <ToolBtn
            title="Highlight"
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >🖊</ToolBtn>
          <Divider />

          {/* Lists */}
          <ToolBtn
            title="Bullet List"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >• List</ToolBtn>
          <ToolBtn
            title="Ordered List"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >1. List</ToolBtn>
          <ToolBtn
            title="Task / Checkbox List"
            active={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >☑ Tasks</ToolBtn>
          <Divider />

          {/* Blocks */}
          <ToolBtn
            title="Blockquote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >❝</ToolBtn>
          <ToolBtn
            title="Code Block"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >{'</>'}</ToolBtn>
          <ToolBtn
            title="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >—</ToolBtn>
          <Divider />

          {/* Alignment */}
          <ToolBtn
            title="Align Left"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >⬅</ToolBtn>
          <ToolBtn
            title="Align Center"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >↔</ToolBtn>
          <ToolBtn
            title="Align Right"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >➡</ToolBtn>
        </div>
      )}

      {/* Editor content area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <EditorContent
          editor={editor}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}

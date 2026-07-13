import { useEffect, useState, useRef, useCallback } from "react";
import {
  EditorState,
  convertToRaw,
  ContentState,
  AtomicBlockUtils,
} from "draft-js";
import { Editor } from "@aloushek/react-draft-wysiwyg-next";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "@aloushek/react-draft-wysiwyg-next/dist/react-draft-wysiwyg.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Custom image upload button rendered in the toolbar
const ImageUploadButton = ({ onChange: _onChange, ...rest }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Notify parent via the custom prop
      if (rest.onImageUpload) {
        rest.onImageUpload(base64);
      }
    };
    reader.readAsDataURL(file);
    // Reset so same file can be picked again
    e.target.value = "";
  };

  return (
    <div className="rdw-image-wrapper" aria-label="rdw-image-control">
      <div
        className="rdw-option-wrapper"
        title="Upload Image"
        onClick={handleClick}
      >
        {/* Camera/image icon (matches wysiwyg toolbar style) */}
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  // Use a ref to track the last HTML we sent up to avoid infinite update loops
  const lastHtmlRef = useRef(value);
  const editorStateRef = useRef<EditorState | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const safeHtmlToDraft = (html: string) => {
    const fn =
      typeof htmlToDraft === "function"
        ? htmlToDraft
        : (htmlToDraft as { default: typeof htmlToDraft }).default;
    return fn ? fn(html) : null;
  };

  const [editorState, setEditorState] = useState(() => {
    if (value) {
      const blocksFromHtml = safeHtmlToDraft(value);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap,
        );
        return EditorState.createWithContent(contentState);
      }
    }
    return EditorState.createEmpty();
  });

  editorStateRef.current = editorState;

  // Sync editorState if value prop changes externally (e.g. reset/delete edits)
  useEffect(() => {
    if (value !== lastHtmlRef.current) {
      lastHtmlRef.current = value;
      if (!value) {
        setEditorState(EditorState.createEmpty());
        return;
      }
      const blocksFromHtml = safeHtmlToDraft(value);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap,
        );
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
  }, [value]);

  const onEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const rawContentState = convertToRaw(newEditorState.getCurrentContent());
    const html = draftToHtml(rawContentState);

    // Only trigger onChange if the HTML content has actually changed
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange(html);
    }
  };

  // Inserts a base64 image directly into the draft-js content
  const handleImageUpload = useCallback((base64: string) => {
    const currentState = editorStateRef.current;
    if (!currentState) return;

    const contentState = currentState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "IMAGE",
      "IMMUTABLE",
      { src: base64, alt: "Uploaded image", height: "auto", width: "auto", alignment: "left" },
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(currentState, {
      currentContent: contentStateWithEntity,
    });
    const nextState = AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      " ",
    );
    setEditorState(nextState);

    // Emit updated HTML
    const rawContentState = convertToRaw(nextState.getCurrentContent());
    const html = draftToHtml(rawContentState);
    lastHtmlRef.current = html;
    onChangeRef.current(html);
  }, []);

  return (
    <div className="rich-text-editor border border-gray-200 rounded-xl overflow-hidden bg-white relative">
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder || "Type here"}
        toolbarClassName="rdw-editor-toolbar"
        editorClassName="rdw-editor-main"
        toolbar={{
          options: ["inline", "list", "link", "emoji", "history"],
          inline: {
            options: ["bold", "italic", "underline", "strikethrough"],
          },
          list: {
            options: ["unordered", "ordered"],
          },
        }}
        toolbarCustomButtons={[
          <ImageUploadButton
            key="editorState"
            onImageUpload={handleImageUpload}
          />,
        ]}
      />
    </div>
  );
};

export default RichTextEditor;

"use client";

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import { Code } from 'lucide-react';

// Dynamic import with SSR disabled
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-surface/50 animate-pulse rounded-xl border border-app flex items-center justify-center text-secondary/30 text-xs">Loading Editor...</div>
});

interface QuillEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export function QuillEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
    className = ''
}: QuillEditorProps) {
    const quillRef = useRef<any>(null);
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState(content);

    // Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false,
        },
    }), []);

    // Quill formats
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    const toggleHtmlMode = () => {
        if (isHtmlMode) {
            // Switching from HTML to WYSIWYG
            onChange(htmlContent);
        } else {
            // Switching from WYSIWYG to HTML
            setHtmlContent(content);
        }
        setIsHtmlMode(!isHtmlMode);
    };

    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newHtml = e.target.value;
        setHtmlContent(newHtml);
        onChange(newHtml);
    };

    return (
        <div className={`quill-editor-wrapper ${className} relative border border-app rounded-xl overflow-hidden bg-surface transition-all focus-within:border-link/30`}>
            {/* HTML Mode Toggle Button */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    type="button"
                    onClick={toggleHtmlMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isHtmlMode
                        ? 'bg-[#D70F24] text-white border-[#D70F24] shadow-lg shadow-red-500/20'
                        : 'bg-app text-secondary border-app hover:text-primary'
                        }`}
                    title={isHtmlMode ? 'Modo Visual' : 'Fonte HTML'}
                >
                    <Code className="w-3.5 h-3.5" />
                    <span>{isHtmlMode ? 'Visual' : 'HTML'}</span>
                </button>
            </div>

            {isHtmlMode ? (
                /* HTML Source Editor */
                <textarea
                    value={htmlContent}
                    onChange={handleHtmlChange}
                    placeholder={placeholder}
                    className="w-full min-h-[400px] p-6 font-mono text-sm bg-app text-primary outline-none resize-y"
                    spellCheck={false}
                />
            ) : (
                /* WYSIWYG Editor */
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    className="nl-quill-editor"
                />
            )}

            <style>{`
                .nl-quill-editor .ql-toolbar {
                    background: var(--nl-surface);
                    border: none;
                    border-bottom: 1px solid var(--nl-border);
                    padding: 12px;
                    padding-right: 100px;
                }
                
                .nl-quill-editor .ql-container {
                    border: none;
                    font-family: inherit;
                    font-size: 15px;
                    min-height: 400px;
                }
                
                .nl-quill-editor .ql-editor {
                    min-height: 400px;
                    padding: 24px;
                    color: var(--nl-text);
                    line-height: 1.6;
                }
                
                .nl-quill-editor .ql-editor.ql-blank::before {
                    color: var(--nl-text-3);
                    font-style: normal;
                    opacity: 0.5;
                }

                .nl-quill-editor .ql-stroke {
                    stroke: var(--nl-text-2) !important;
                }
                .nl-quill-editor .ql-fill {
                    fill: var(--nl-text-2) !important;
                }
                .nl-quill-editor .ql-active .ql-stroke {
                    stroke: var(--nl-accent) !important;
                }
                .nl-quill-editor .ql-active .ql-fill {
                    fill: var(--nl-accent) !important;
                }
                .nl-quill-editor .ql-picker-label {
                    color: var(--nl-text-2) !important;
                }

                .dark .ql-snow .ql-picker.ql-expanded .ql-picker-options {
                    background-color: var(--nl-surface);
                    border-color: var(--nl-border);
                }
            `}</style>
        </div>
    );
}

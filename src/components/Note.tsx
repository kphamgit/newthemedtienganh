import React from "react";
import "../styles/Note.css"

export interface NoteProps {
    
        id: number;
        title: string;
        content: string;
        created_at: string;
    
    onDelete: (id: number) => void;
}

function Note({ id, title, content, created_at, onDelete }: NoteProps) {
    const formattedDate = new Date(created_at).toLocaleDateString("en-US")

    return (
        <div className="note-container">
            <p className="note-title">{title}</p>
            <p className="note-content">{content}</p>
            <p className="note-date">{formattedDate}</p>
            <button className="delete-button" onClick={() => onDelete(id)}>
                Delete
            </button>
        </div>
    );
}

export default Note
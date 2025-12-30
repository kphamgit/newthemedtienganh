import "../styles/Note.css"

export interface CategoryProps {
    id: number,
    name: string
    category_number: number
}

export interface LevelProps {
        level_number: number;
        name: string;
        categories: CategoryProps[];
}

function Level({ level_number, name }: LevelProps) {
    //const formattedDate = new Date(created_at).toLocaleDateString("en-US")

    return (
        <div className="note-container">
            <p className="note-title">{name}</p>
            <p className="note-content">{level_number}</p>
        </div>
    );
}

export default Level
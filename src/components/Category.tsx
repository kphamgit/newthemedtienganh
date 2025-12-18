import "../styles/Note.css"

export interface SubCategoryProps {
    id: number,
    name: string
    sub_category_number: number
    }

export interface CategoryProps {
        category_number: number;
        name: string;
        sub_categories: SubCategoryProps[];
}

function Category({ category_number, name }: CategoryProps) {
    //const formattedDate = new Date(created_at).toLocaleDateString("en-US")

    return (
        <div className="note-container">
            <p className="note-title">{name}</p>
            <p className="note-content">{category_number}</p>
        </div>
    );
}

export default Category
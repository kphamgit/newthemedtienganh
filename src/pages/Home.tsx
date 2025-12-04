import { useState, useEffect } from "react";
import api from "../api";
import { type NoteProps } from "../components/Note";
import { type CategoryProps} from "../components/Category";
import "../styles/Home.css"
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Home() {
    const [_notes, setNotes] = useState<NoteProps[]>([]);
    //const [content, setContent] = useState("");
    const [_title, _setTitle] = useState("");

    /*
const [notes, setNotes] = useState<NoteProps[]>([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    */


    const [categories, setCategories] = useState<CategoryProps[]>([]);

    useEffect(() => {
        getNotes();
        getCategories();
    }, []);

    const getNotes = () => {
        api
            .get("/api/notes/")
            .then((res) => res.data)
            .then((data) => {
                setNotes(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const getCategories = () => {
        api
            .get("/api/categories/")
            .then((res) => res.data)
            .then((data) => {
                setCategories(data);
                console.log("categories", data);
            })
            .catch((err) => alert(err));
    };

    /*
    const deleteNote = (id: number) => {
        api
            .delete(`/api/notes/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Note deleted!");
                else alert("Failed to delete note.");
                getNotes();
            })
            .catch((error) => alert(error));
    };

    const createNote = (e: React.FormEvent) => {
        e.preventDefault();
        api
            .post("/api/notes/", { content, title })
            .then((res) => {
                if (res.status === 201) alert("Note created!");
                else alert("Failed to make note.");
                getNotes();
            })
            .catch((err) => alert(err));
    };
    */

    return (
        <>
        <div className="bg-amber-200 p-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" categories={categories}/>
            </div>
        </div>
        <Outlet />
        </>
    );
}

export default Home;

/*
 return (
        <>
        <div className="bg-amber-200 p-10">
              <div className='col-span-9 bg-bgColor2 text-textColor2 text-lg m-1'>
              <Navbar role="student" categories={categories}/>
            </div>
            <div>
                <h2>Categories</h2>
                {categories.map((category: CategoryProps) => (
                    <Category {...category} key={category.category_number} />
                ))}
                {notes.map((note: NoteProps) => (
                    <Note {...note} onDelete={deleteNote} key={note.id} />
                ))}
            </div>
            <h2>Create a Note</h2>
            <form onSubmit={createNote}>
                <label htmlFor="title">Title:</label>
                <br />
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        </div>
        <Outlet />
        </>
    );
*/

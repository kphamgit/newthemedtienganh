import "../styles/Note.css"
//import type { CategoryProps } from "./Category";
import { useNavigate, useParams } from 'react-router-dom';
import api from "../api";
import { useEffect, useState } from "react";

interface UnitProps {
    id: number,
    name: string,
    unit_number: number,
    quizzes?: QuizProps[]
}

interface QuizProps {
    id: number,
    name: string,
    quiz_number: number
}
 

function SubCategory() {
    const params = useParams<{ sub_category_id: string }>();
    const [units, setUnits] = useState<UnitProps[]>([]);
    const [id, setId] = useState<number>(0);
    //const formattedDate = new Date(created_at).toLocaleDateString("en-US")

    const navigate = useNavigate();

    useEffect(() => {
       if (params.sub_category_id) {
           setId(parseInt(params.sub_category_id));
       }
    }, [params.sub_category_id]);

    useEffect(() => {
        if (id !== 0) {
            getUnits();
        }
    }, [id]);

    const getUnits = () => {
        api
            .get(`/api/sub_categories/${id}/units`)
            .then((res) => res.data)
            .then((data) => {
                setUnits(data);
                //console.log("units", data);
            })
            .catch((err) => alert(err));
    };

    const take_quiz = (quiz: QuizProps) => {
        //console.log("Taking quiz:", quiz.id);
        const api_url = `/sub_categories/${id}/take_quiz/${quiz.id}`
        //console.log("Navigating to:", api_url);
        navigate(api_url)
    }

    return (
        <div className="flex flex-col bg-amber-100 p-10">
            {
                units.map((unit) => (
                    <div key={unit.id}>
                        <p className="px-3">Unit {unit.unit_number}. <span>{unit.name}</span></p>
                        
                        {
                            unit.quizzes && unit.quizzes.map((quiz) => (
                                <div key={quiz.id} style={{ marginLeft: '20px' }}>
                                    <p>Quiz: {quiz.quiz_number}</p>
                                    <button className=' px-2 rounded-md hover:underline bg-blue-100' onClick={() => take_quiz(quiz)}>
                                        {quiz.name} Quiz id: {quiz.id} </button>
                                </div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}

export default SubCategory
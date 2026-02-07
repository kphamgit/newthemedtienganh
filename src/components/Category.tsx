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
    quiz_number: number,
    video_url?: string,
    video_segments? : any[]
}
 

function Category() {
    const params = useParams<{ category_id: string }>();
    const [units, setUnits] = useState<UnitProps[]>([]);
    const [id, setId] = useState<number>(0);

    const navigate = useNavigate();

    useEffect(() => {
       if (params.category_id) {
           setId(parseInt(params.category_id));
       }
    }, [params.category_id]);

    useEffect(() => {
        if (id !== 0) {
            //console.log("Fetching units for category id:", id);
            getUnits();
        }
    }, [id]);

    const getUnits = () => {
        //alert("Getting units for category id:");
        
        api
            .get(`/api/categories/${id}/units/`)
            .then((res) => res.data)
            .then((data) => {
                console.log("************ units", data);
                setUnits(data);
               
            })
            .catch((err) => alert(err));
            
    };

    const take_quiz = (quiz: QuizProps) => {
        //console.log("Taking quiz:", quiz.id);
        const api_url = `/categories/${id}/take_quiz/${quiz.id}`
        //console.log("Navigating to:", api_url);
        navigate(api_url)
    }

    const take_video_quiz = (quiz: QuizProps) => {
        console.log("Taking video quiz:", quiz);
        const api_url = `/categories/${id}/take_video_quiz/${quiz.id}`
        navigate(api_url, {state: {quiz_id: quiz.id, video_url : quiz.video_url, video_segments: quiz.video_segments}})
    }

    return (
        <div className="flex flex-col bg-amber-100 p-10">
            {
                units.map((unit) => (
                    <div key={unit.id}>
                        <p className="px-3 my-1 text-blue-500 text-lg">Unit {unit.unit_number}. <span>{unit.name}</span></p>
                        
                        {
                            unit.quizzes && unit.quizzes.map((quiz) => (
                                <div key={quiz.id} className="px-6 my-1">
                                    <span>{quiz.quiz_number}.</span>
                                    <button className=' px-2 rounded-md hover:underline' onClick={() => take_quiz(quiz)}>
                                        {quiz.name} 
                                    </button>
                                    { quiz.video_url && 
                                    <>
                                        <span className="text-sm text-gray-500"> (video available) url = {quiz.video_url}</span>
                                        <button className=' px-2 rounded-md hover:underline' onClick={() => take_video_quiz(quiz)}>
                                        {quiz.name} 
                                    </button>
                                    </>
                                    }
                                </div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}

export default Category
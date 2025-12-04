import "../styles/Note.css"
//import type { CategoryProps } from "./Category";
import { useParams } from 'react-router-dom';
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
            .get(`/api/units/${id}/`)
            .then((res) => res.data)
            .then((data) => {
                setUnits(data);
                console.log("units", data);
            })
            .catch((err) => alert(err));
    };

    const take_quiz = (quiz: QuizProps) => {
        console.log("Taking quiz:", quiz.id);
        /*
        if (sub_category) {
            //const api_url = `/sub_categories/${sub_category.name}/quizzes/${quiz_id}`
            //"sub_categories/:sub_category_name/take_quiz/:quizId" element={<TakeQuiz />} />
            if (quiz.video_url === null || quiz.video_url === '') {
                const api_url = `/sub_categories/${sub_category.id}/take_quiz/${quiz.id}`
                navigate(api_url)
            }
            else {
                //console.log("******* video quiz")
                const api_url = `/sub_categories/${sub_category.id}/take_video_quiz/${quiz.id}`
                navigate(api_url)
            }
           
        }
            */
    }

    return (
        <div className="note-container">
            SUB CATTTT {id}
            {
                units.map((unit) => (
                    <div key={unit.id}>
                        <p>{unit.name}</p>
                        <p>Unit number: {unit.unit_number}</p>
                        {
                            unit.quizzes && unit.quizzes.map((quiz) => (
                                <div key={quiz.id} style={{ marginLeft: '20px' }}>
                                    <p>Quiz number: {quiz.quiz_number}</p>
                                    <button className=' px-2 rounded-md hover:underline bg-bgColor2 text-textColor2' onClick={() => take_quiz(quiz)}>
                                       Quiz Name:  {quiz.name}</button>
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

/*
       <div>
                                     
                                            {  user.role === 'teacher' &&
                                            <button className=' px-2 rounded-md hover:underline bg-bgColor2 text-textColor2' onClick={() => assign(quiz)}>ASSIGN</button>
                                            }
                                            </div>
                                    </div>
*/

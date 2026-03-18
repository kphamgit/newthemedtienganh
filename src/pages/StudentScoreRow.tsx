import { FaSpinner } from 'react-icons/fa';
import {type UserRowProps } from '../components/context/UserConnectionsContext';

function StudentScoreRow({user}: {user: UserRowProps}) {
  return (
    <div className='flex flex-row justify-start mb-2 items-center bg-cyan-100 px-2' >
    <div>{user.name}</div>
          {user.live_question_number !== undefined &&
              <>
                  <div
                      className={`${user.live_score === undefined ? "bg-amber-600" : "bg-green-600"
                          } py-0 ml-1 px-2 rounded-full text-md text-white`}
                  >{user.live_question_number}
                  </div>

                  <div className='flex flex-row justify-center items-center ml-2'>
                      <div className='mx-2'>Score:</div>
                      <div>
                          {user.live_score === undefined ?

                              <FaSpinner className="animate-spin text-blue-500" size={17} />
                              :
                              <span className="ml-2">{user.live_score}</span>
                          }
                      </div>
                  </div>
                  {user.live_total_score !== undefined && user.live_total_score !== 999 &&
                      <div className='flex flex-row justify-center items-center ml-2'>

                          <div className='p-1 mx-2'>Total:</div>
                          <div>
                              <span className="ml-2">{user.live_total_score}</span>

                          </div>

                      </div>
                  }

              </>
          }
        </div>
  )
}

export default StudentScoreRow

/*
           <div className='flex flex-col justify-start mb-2 items-center bg-cyan-100 px-2' key={index}>
                            <div
                                className={`flex flex-row justify-start text-red-900 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                    }`}
                            >
                                <div>
                                {user.name}
                                </div>
                                {user.live_question_number !== undefined &&
                                <>
                                    <div
                                        className={`${user.live_score === undefined ? "bg-amber-600" : "bg-green-600"
                                            } py-0 ml-1 px-2 rounded-full text-md text-white`}
                                    >{user.live_question_number}
                                    </div>

                                    <div className='flex flex-row justify-center items-center ml-2'>
                                        <div className='mx-2'>Score:</div>
                                        <div>
                                            {user.live_score === undefined ?

                                                <FaSpinner className="animate-spin text-blue-500" size={17} />
                                                :
                                                <span className="ml-2">{user.live_score}</span>
                                            }
                                        </div>
                                    </div>
                                </>
                                }
                                {user.live_total_score !== undefined && user.live_total_score !== 999 &&
                                <div className='flex flex-row justify-center items-center ml-2'>
                                    
                                    <div className='p-1 mx-2'>Total:</div>
                                    <div>
                                        <span className="ml-2">{user.live_total_score}</span>

                                    </div>

                                </div>
                                }

                            </div>
    
                        </div>
*/

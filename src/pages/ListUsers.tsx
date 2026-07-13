import type { UserRowProps } from "../components/context/UserConnectionsContext";
import DisplayRecordings from "./DisplayRecordings";

interface ListUsersProps {
    userRows: UserRowProps[];
    onUserNameClick: (userName: string) => void;
}

function ListUsers({ userRows, onUserNameClick }: ListUsersProps) {
    return (
        <div className="bg-green-300 p-2 mb-2">
            <div>
                <button
                    className='bg-amber-700 text-white hover:bg-amber-900 p-1 rounded-md mb-2'
                    onClick={() => { onUserNameClick('everybody') }}
                >
                    Everybody
                </button>
            </div>
            {userRows && userRows.length > 0 &&
                userRows.map((user, index) => (
                    <div className='flex flex-row justify-start mb-2 items-center bg-green-100 px-2' key={index}>
                        <div
                            className={`text-blue-800 font-bold ${user.is_logged_in === false ? "opacity-50" : "opacity-100"
                                }`}
                        >
                            <button
                                className='bg-green-700 text-white hover:bg-green-900 p-1 rounded-md'
                                onClick={() => { onUserNameClick(user.name) }}
                            >
                                {user.name}
                            </button>
                        </div>
                    </div>
                ))
            }
            <DisplayRecordings />
        </div>
    );
}

export default ListUsers;

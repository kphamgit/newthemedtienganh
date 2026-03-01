            // 1. Imports and Type Definitions
import { type Dispatch, type ReactNode, type SetStateAction,useState, createContext } from "react"
 
 //CHAT GPT explanation:

/*
 React Imports:
Dispatch, SetStateAction: These are TypeScript types that help type the setter function returned from useState.
ReactNode: Represents any valid React child (JSX elements, strings, numbers, etc.).
useState: React hook for managing state in functional components.
createContext: Creates a context object that can be used to share data between componentswithout prop drilling.
   */

import { SpeechConfig, 
   } from 'microsoft-cognitiveservices-speech-sdk';
/*
This comes from the Microsoft Cognitive Services Speech SDK and is used to create a 
configuration object for speech services.
*/
            //2. Defining the Data Types

//AzureTtspeech configuration Type
export type AzureTtspeech = {
   config: SpeechConfig
}

/*
Purpose: This type represents an object with a single property config, which is an instance
 of SpeechConfig. This encapsulates the configuration for Azure Text-to-Speech (TTS).
*/

export interface TtSpeechContextInterface {
    ttSpeechConfig: AzureTtspeech,
    setTtSpeechConfig: Dispatch<SetStateAction<AzureTtspeech>>
}

/*
Purpose: This interface defines the shape of the context value. It includes:
ttSpeechConfig: The current speech configuration.
setTtSpeechConfig: A function that updates the ttSpeechConfig state. Its type is inferred from useState, ensuring type safety when updating the configuration.

*/

            //3. Creating a Default State and Context
//Default State
const defaultState = {
    ttSpeechConfig: {
        config: {}
    }
} as TtSpeechContextInterface

/*
Explanation:
A defaultState is defined to provide an initial value for the context.
Here, ttSpeechConfig.config is set to an empty object. This is then type-asserted as TtSpeechContextInterface to satisfy the TypeScript type system.
In a real-world scenario, you might want this default to be more meaningful or handle the absence of a valid configuration more gracefully.

*/

//Creating the Context
export const TtSpeechContext = createContext(defaultState)
/*
Explanation:
createContext is used to create a new context with the provided default state.
This context will later be used to supply and consume the Azure TTS configuration throughout the component tree.
*/

                //4. Creating the Provider Component
//Props for the Provider
type TtSpeechProviderProps = {
    children: ReactNode
}
/*
Explanation:
The provider component accepts children as its prop. This allows you to wrap other components
 inside the provider so that they have access to the context.
*/

//TtSpeechProvider Component
export default function TtSpeechProvider({children} : TtSpeechProviderProps)
{
    const [ttSpeechConfig, setTtSpeechConfig] = useState<AzureTtspeech>({
      config: SpeechConfig.fromSubscription('0a1e83a35c7642c49b193de23611e07f', 'eastus')
    })

    return (
        <TtSpeechContext.Provider value = {{ttSpeechConfig, setTtSpeechConfig }}>
            {children}
        </TtSpeechContext.Provider>
    )
}

/*
useState Initialization:

The component calls useState to initialize ttSpeechConfig.
The initial state is an object containing a config property, which is created by calling SpeechConfig.fromSubscription(...) with a subscription key and region ('eastus').
This initializes the speech configuration for Azure TTS using Microsoft's SDK.
Context Provider:

The component returns a <TtSpeechContext.Provider> that wraps around children.
The value passed to the provider includes:
ttSpeechConfig: The current state.
setTtSpeechConfig: The setter function to update the state.
This makes the Azure TTS configuration and its updater function available to any descendant components that consume this context.

*/

/*
            Summary
Purpose:
The code sets up a React context for managing an Azure Text-to-Speech configuration. It creates a provider component (TtSpeechProvider) that:
Initializes the speech configuration using Microsoft’s Cognitive Services Speech SDK.
Provides both the configuration and a function to update it via context, making it accessible to nested components.
Usage:
Components that need to access or modify the speech configuration can consume TtSpeechContext using useContext, allowing for centralized state management without prop drilling.
This pattern is useful when multiple components need to interact with or update shared configuration data in a React application, ensuring consistency and ease of maintenance.
*/
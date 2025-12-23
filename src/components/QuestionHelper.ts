interface DynamicObject {
    [key: string]: any;
  }

class QuestionHelper {
   //(question, props.user_answer)
    format_user_answer = (answer: string | undefined, answer_key: string, format: string | undefined, content: string): string | undefined => {
        //console.log(" questionHelper format_user_answer,  format", format, " user answer = ", answer, " answer_key = ", answer_key)
        if (answer) {
            if (format === '1' || format === '2') {  //cloze
                const replacements: DynamicObject = {};
                const answer_key_parts = answer_key.split('/')
                const user_answer_parts = answer.split('/')
                answer_key_parts.forEach( (answer_key_part, index) => {
                    //console.log("mmmmm", answer_key_part)
                    //replacements[part] = part
                    if (answer_key_part.includes('*')) {    //blank has multiple correct answers
                        const first_answer = answer_key_part.split('*')[0]  // only use the first answer
                        replacements[first_answer] = user_answer_parts[index]
                    }
                    else {
                        replacements[answer_key_part] = user_answer_parts[index]
                    }
                })
                const newStr = content.replace(/\[(.*?)\]/g, (match, p1) =>
                    replacements[p1] || match // Replace if found in object, otherwise keep original
                );
                const newStr1 = newStr.replace(/\[(.*?)\]/g, '');
                //console.log("xxxxx newStr1=", newStr1)
                return (
                    newStr1
                )
                //return content.replace(/\[|\]/g, "")
            }
            else if (format === '10') {     // 10= dropdown, 2= button cloze -select
                const replacements: DynamicObject = {};
                const answer_parts = answer_key.split('/')
                const user_answer_parts = answer.split('/')
                //["to take him"]
                //console.log("answer_parts = ", answer_parts)
                //answer_parts =  ['to donate']
                answer_parts.forEach( (part, index) => {
                    const key = '^' + part
                    //replacements[key] = answer_parts[index]
                    replacements[key] = user_answer_parts[index]
                })
                //console.log("replacements = ", replacements)
//I want to kill/to be killed.
                //const test_content = "I want [^to donate/to be donate] and he wants to [be gottent the money/^get the money]";
                //const test_replacements: DynamicObject = {"^to donate": "to donate", "^get the money": "get the money"};
                const newStr = content.replace(/\[(.*?)\]/g, (match, match_content_without_brackets) => {
                    //console.log("match = ", match)
                    //console.log("match_content_without_brackets1 = ", match_content_without_brackets)
                    //match_content_without_brackets1 =  be gottent the money/^get the money
                    // search match_content_without_brackets for answer key
                    const arr = match_content_without_brackets.split('/')
                    //console.log("arr = ", arr)
                    //arr =  ['be gottent the money', '^get the money']
                    const answer_key = arr.find((element:any) => element.startsWith('^'))
                    //console.log("answer_key = ", answer_key)
                    //answer_key =  ^get the money
                    return replacements[answer_key] || match
                    //return test_replacements[match_content_without_brackets] || match
                })
                //console.log("YYYYYYYYYYYYY6666 test_newStr = ", newStr)
                

                return newStr
            }
            else if (format === '6') {  //word scramble
                const answer_parts: string[] = answer.split('/')
                const result = answer_parts.map((part) => (
                    part
                ))
                return result.join('/').replaceAll('/', ' ')
            }

            else {
                return answer
            }
        }
        else {
            return 'EMPTY user answer'
        }
    }

    format_answer_key = (answer_key: string, format: string | undefined, content: string): string | undefined => {
        if (answer_key) {
            //console.log("YYYYY format_answer_key ansswer key = ", answer_key, "format = ", format)
            if (format === '1' || format === '2') {  //cloze
                //console.log("format_answer_key format = ", format)
                const replacements: DynamicObject = {};
                const answer_parts = answer_key.split('/')
                answer_parts.forEach( (part, index) => {
                 
                if (part.includes('*')) {    //blank has multiple correct answers
                   
                    const first_answer = part.split('*')[0]  // only use the first answer
                    
                    replacements[first_answer] = answer_parts[index].replace('*','/')
                }
                else {
                    // use answer_part as property of replacements object
                    replacements[part] = answer_parts[index]
                }})
                
                //I want [to take him] to the hospital.
                //console.log("replacement = ", replacements)
                // replacements: {"to be taken": "to be taken"}
                //console.log("content = ", content)
                //I want him [to be taken] to the hospital.
                // match any string that starts with [ and ends with ] and replace them with the value of the property
                // in replacements object

                //javascript: kpham. The following code search string "content" globally for strings enclosed with square brackets.
                // and apply a callback function to each match. The callback function which has two argument: 1) the match including
                // the brackets and 2) the content of the match without the brackets. If the content of the match is found in the
                // replacements object, (in the sentence) it will be replaced with the value of the property in the replacements object.
                //  Otherwise, the original match will be kept.

                 const newStr = content.replace(/\[(.*?)\]/g, (match, match_content_without_brackets) => {
                    //console.log("match = ", match)
                    // match =  [to be taken] 
                    //console.log("match_content_without_brackets = ", match_content_without_brackets)
                    // p1 =  to be taken 
                    return replacements[match_content_without_brackets] || match // Replace if found in object, otherwise keep original
              }
              );
              //console.log("newStr =", newStr)
              const newStr1 = newStr.replace(/\[(.*?)\]/g, '');
              //console.log("xxxxx newStr1=", newStr1)
              return newStr1
              
                //return content.replace(/\[|\]/g, "")
            }
            else if (format === '6') {  //word scramble
                const answer_parts: string[] = answer_key.split('/')
                const result = answer_parts.map((part) => (
                    part
                ))
                return result.join('/').replaceAll('/', ' ')
            }
            else if (format === '10' || format === '2') {

                const replacements: DynamicObject = {};
                const answer_parts = answer_key.split('/')
                //["to take him"]
                //console.log("answer_parts = ", answer_parts)
                //answer_parts =  ['to donate']
                answer_parts.forEach( (part, index) => {
                    const key = '^' + part
                    replacements[key] = answer_parts[index]
                })
                //console.log("replacements = ", replacements)
//I want to kill/to be killed.
                
                //console.log("xxxxx content =", content)
                //const test_content = "I want [^to donate/to be donate] and he wants to [be gottent the money/^get the money]";
                //const test_replacements: DynamicObject = {"^to donate": "to donate", "^get the money": "get the money"};
                const newStr = content.replace(/\[(.*?)\]/g, (match, match_content_without_brackets) => {
                    //console.log("match = ", match)
                    //console.log("match_content_without_brackets1 = ", match_content_without_brackets)
                    //match_content_without_brackets1 =  be gottent the money/^get the money
                    // search match_content_without_brackets for answer key
                    const arr = match_content_without_brackets.split('/')
                    //console.log("arr = ", arr)
                    //arr =  ['be gottent the money', '^get the money']
                    const answer_key = arr.find((element:any) => element.startsWith('^'))
                    //console.log("answer_key = ", answer_key)
                    //answer_key =  ^get the money
                    return replacements[answer_key] || match
                    //return test_replacements[match_content_without_brackets] || match
                })
                //console.log("YYYYYYYYYYYYY6666 test_newStr = ", newStr)
                return newStr
            }
            else {
                return answer_key
            }
        }
     
        else {
            return 'EMPTY answer key'
        }
    }
}
export default new QuestionHelper();

/*
const replacements = { "to be taken": "to be taken" };
const content = "I want him [to be taken] to the hospital";
const newStr = content.replace(/\[(.*?)\]/g, (match, p1) => {
    return replacements[p1] || match;
});
Explanation:
replacements Object

This is a dictionary (object) that maps specific phrases to replacement values.
It currently has one entry: "to be taken": "to be taken", which essentially replaces it with itself (no change).
content String

Contains a sentence with a phrase inside square brackets:
"I want him [to be taken] to the hospital"
Regular Expression (/\[(.*?)\]/g)

Matches any text enclosed in square brackets [ ].
.*? is a lazy match, capturing the smallest possible content inside brackets.
g flag ensures it finds all occurrences in the string.
replace Function

match: The entire match (including brackets), e.g., "[to be taken]".
p1: The captured text inside brackets, e.g., "to be taken".
If p1 exists in replacements, it gets replaced with the corresponding value.
If it’s not in replacements, it keeps the original match.
Result:
Since "to be taken" exists in replacements, the output will be:

javascript
Copy
Edit
"I want him to be taken to the hospital"
The square brackets are removed, and the text inside them is replaced accordingly.

What If the Phrase Isn't in replacements?
If the content were:

javascript
Copy
Edit
const content = "I want him [to be arrested] to the hospital";
Since "to be arrested" does not exist in replacements, the output would be:

javascript
Copy
Edit
"I want him [to be arrested] to the hospital"
It remains unchanged.

*/
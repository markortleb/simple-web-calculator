let resultShowing = false;


function clearScreen(calcScreen){
    calcScreen.textContent = '';
}


function calculate(calcScreen){
    const getHierarchy = op => {
        let opHierarchy = -1;
        if (op === '+' || op === '-'){
            opHierarchy = 1;
        }else if (op === '*' || op === '/'){
            opHierarchy = 2;
        }else if (op === '^'){
            opHierarchy = 3;
        }else if (op === '('){
            opHierarchy = 4;
        }
        return opHierarchy;
    };

    const loadCalcElements = calcLine => {
        let calcElements = [];
        let numBuffer = '';
        let previousChar = '';

        for (let i = 0; i < calcLine.length; i++){
            if (calcLine[i] >= '0' && calcLine[i] <= '9' || calcLine[i] === '.'){
                numBuffer = numBuffer + calcLine[i];

            } else{
                if (numBuffer !== ''){
                    calcElements.push(numBuffer);
                    numBuffer = '';
                }

                // Allows us to interpret (6)(5) as 6*5
                if (calcLine[i] === '('){
                    if (previousChar >= '0' && previousChar <= '9' || previousChar === ')'){
                        calcElements.push('*');
                    }
                }

                // handles leading negative like -6*6
                if (calcLine[i] === '-' && previousChar === ''){
                    calcElements.push('0');
                }

                calcElements.push(calcLine[i]);
            }

            if (i + 1 === calcLine.length && numBuffer !== ''){
                calcElements.push(numBuffer);
                numBuffer = '';
            }

            previousChar = calcLine[i];
        }

        return calcElements;
    };

    const resolveCalculation = calcElements => {
        let conversionStack = [];
        let postfixQueue = [];
        let calcStack = [];
        let left = 0.0;
        let right = 0.0;

        while (calcElements.length !== 0){
            if (calcElements[0] === '('){
                conversionStack.push(calcElements[0]);

            } else if (calcElements[0] === ')' && conversionStack.length !== 0){
                while(conversionStack[conversionStack.length - 1] !== '('){
                    postfixQueue.push(conversionStack[conversionStack.length - 1]);
                    conversionStack.pop();
                }
                conversionStack.pop();

            } else if (calcElements[0] === '+' || calcElements[0] === '-'
                    || calcElements[0] === '*' || calcElements[0] === '/' || calcElements[0] === '^'){

                while(conversionStack.length !== 0 && conversionStack[conversionStack.length - 1] !== '('
                        && getHierarchy(calcElements[0]) <= getHierarchy(conversionStack[conversionStack.length - 1])){

                    postfixQueue.push(conversionStack[conversionStack.length - 1]);
                    conversionStack.pop();
                }
                conversionStack.push(calcElements[0]);

            } else{
                postfixQueue.push(calcElements[0]);
            }

            calcElements.shift();
        }

        while(conversionStack.length !== 0){
            postfixQueue.push(conversionStack[conversionStack.length - 1]);
            conversionStack.pop();
        }

        // Verify all numbers have at most one decimal
        for (let postfixValue of postfixQueue){
            if ((postfixValue.match(/\./g) || []).length > 1){
                throw `${postfixValue} is not a number`;
            }
        }

        while (postfixQueue.length !== 0){
            if (postfixQueue[0] === '+' || postfixQueue[0] === '-' || postfixQueue[0] === '*'
                    || postfixQueue[0] === '/' || postfixQueue[0] === '^'){
                if (calcStack.length < 2){
                    throw 'Bad operation';
                }else{
                    right = parseFloat(calcStack[calcStack.length - 1]);
                    calcStack.pop();
                    left = parseFloat(calcStack[calcStack.length - 1]);
                    calcStack.pop();

                    if (postfixQueue[0] === '/' && right === 0.0){
                        throw 'Divide by zero error';
                    }

                    switch (postfixQueue[0]){
                        case '+':
                            calcStack.push(left + right);
                            break;
                        case '-':
                            calcStack.push(left - right);
                            break;
                        case '*':
                            calcStack.push(left * right);
                            break;
                        case '/':
                            calcStack.push(left / right);
                            break;
                        case '^':
                            calcStack.push(Math.pow(left, right));
                            break;
                    }
                }
            } else{
                try {
                    calcStack.push(parseFloat(postfixQueue[0]));

                } catch (e){
                    throw 'Bad operation';
                }
            }
            postfixQueue.shift();
        }

        if (isNaN(calcStack[calcStack.length - 1])){
            throw 'Bad operation';
        }

        return calcStack[calcStack.length - 1];
    };

    let calcResult;

    try {
        calcResult = resolveCalculation(loadCalcElements(calcScreen.textContent));
    } catch (e){
        console.log(e);
        calcResult = 'ERROR';
    }

    calcScreen.textContent = calcResult;
    resultShowing = true;
}

function appendCalcScreen(e, calcScreen){
    if (([...Array(10).keys()].includes(parseInt(e.target.textContent)) || e.target.textContent === '(')
            && resultShowing || resultShowing === 'ERROR'){
        calcScreen.textContent = e.target.textContent;
    } else{
        calcScreen.textContent = calcScreen.textContent + e.target.textContent;
    }
    resultShowing = false;

}

function buttonClicked(e, calcScreen){

    switch (e.target.className){
        case 'calculate':
            calculate(calcScreen);
            break;
        case 'clear':
            clearScreen(calcScreen);
            break;
        default:
            appendCalcScreen(e, calcScreen);
    }
    e.target.classList.add('clicking');
}

function removeTransition(e){
    if (e.propertyName !== 'transform') return; // skip it if not a transform
    e.target.classList.remove('clicking');
}

function initButtons(){
    const calcScreen = document.querySelector('.calculator-screen p');
    const buttons = document.querySelectorAll('button');

    for (button of buttons){
        button.addEventListener('click', e => buttonClicked(e, calcScreen));
        button.addEventListener('transitionend', e => removeTransition(e));
    }
}


initButtons();

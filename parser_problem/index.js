/**
 * SHOULD Take a string containing opening and closing
 * parenthsis such as "(1+2)*3" and verifies for every
 * opening parenthesis there will be a closing
 * parenthesis.
 * @param {string} str
 * @returns {boolean} - whether the parenthesis are valid or not
 *
 * BUGGY 1.
 */
function parensChecker(str) {
  let i = 0;
  let parenDepthCount = 0;
  while(i < str.length) {
    const char = str[i];
    if(char === '(') {
      parenDepthCount++;
    } else if(char === ')') {
      parenDepthCount--;
      if(parenDepthCount < 0) {
        return false;
      }
    }
    i++;
  }
  return true;
}

console.log("parensChecker - Should be: true", parensChecker("(1-2)+(3*4)"));
console.log("parensChecker - Should be: true", parensChecker("((1-2)+(3*4)-(3))"));
console.log("parensChecker - Should be: false", parensChecker("(1-2)+(3*4)("));
console.log("parensChecker - Should be: false", parensChecker("(1) + (2))"));


//Token types - Used below
const OPEN_PAREN = 'Open Parenthesis';
const CLOSE_PAREN = 'Close Parenthesis';
const NUMBER = 'Number';
const OPERATOR = 'Operator';

//Taking some string of charecters representing a mathematical equation
//like (10+22)*332 and returns a list of organized "tokens"
//representing those charecters such as
/**
 *
 * [
 * { type: "Open Bracket" },
 * { type: "Number", value: 10 },
 * { type: "Operator", value: "+" },
 * { type: "Number", value: 22 },
 * { type: "Close Bracket" },
 * { type: "Operator", value: "*" },
 * { type: "Number", value: 332 },
 * ]
 *
 */
function tokenizer(str) {
  const tokens = [];
  const len = str.length;
  let i = -1;
  while(i < len) {
    i++;
    let c = str[i];
    if (c === ' ') {
      continue;
    }
    if (c === '(') {
      tokens.push({type:OPEN_PAREN});
      continue;
    }
    if (c === ')') {
      tokens.push({type:CLOSE_PAREN});
      continue;
    }
    if (c === '+' || c === '*') {
      tokens.push({type:OPERATOR, value: c});
      continue;
    }
    if (charIsNum(c)) {
      let stringNum = c;
      while (i+1 < len && charIsNum(str[i+1])) {
        i++;
        stringNum+=str[i];
      }
      let asNumber = parseInt(stringNum);
      tokens.push({type:NUMBER, value:asNumber});
      continue;
    }
  }
  return tokens;
}

console.log('tokenizer Example: ',tokenizer('(123 + 432)*2'));

function charIsNum(c) {
  return c >= '0' && c <='9'
}


/**
 * Accepts a string of a basic arethmatic operation
 * such as 3*(1+2), and will covert it
 * into a Abstract Syntax tree (AST) like so:
 *     (*)
 *    /   \
 *  (3)   (+)
 *        / \
 *       1   2
 *
 * This tree will ignore order of operations in mathematical terms -
 * it will just move from left to right, unless there
 * are parenthesis
 * @param expression
 */
function arthematicTreeMaker(expression) {
  if (!parensChecker(expression)) throw Error("Parenthesis mismatch");
  const tokens = tokenizer(expression);
  return arthematicTreeMakerFromTokens(tokens)
}
function arthematicTreeMakerFromTokens(tokens, tracker = {tokenIndex: 0}) {
    if (!tokens.length) return;
    const token = tokens[tracker.tokenIndex];
    const AST = {};
    switch(token.type) {
      case NUMBER: {
        if(tokens.length > tracker.tokenIndex + 1) {
          AST.left = token.value;
          AST.operator = tokens[tracker.tokenIndex + 1].value;
          tracker.tokenIndex+=2;
          AST.right = arthematicTreeMakerFromTokens(tokens, tracker);
          return AST;
        }
        return token.value;
      }
      case OPEN_PAREN: {
        let tokenRange = 0;
        while (tokens[tracker.tokenIndex + tokenRange].type !== CLOSE_PAREN) {
          tokenRange++;
        }
        const originalIndex = tracker.tokenIndex;
        tracker.tokenIndex += tokenRange;
        let expression = arthematicTreeMakerFromTokens(tokens.slice(originalIndex + 1,originalIndex + tokenRange));
        if(tracker.tokenIndex < tokens.length - 1) {
          AST.left = expression;
          AST.operator = tokens[tracker.tokenIndex + 1].value;
          tracker.tokenIndex+=2; // skip operator and closing paren
          AST.right = arthematicTreeMakerFromTokens(tokens, tracker);
          return AST;
        }
        return expression
      }
    }

  return AST;
}

console.log("arthematicTreeMaker('(3*1)+2')\n", arthematicTreeMaker('(3*1)+2'));
console.log("arthematicTreeMaker('3*(1+2)')\n", arthematicTreeMaker('3*(1+2)'));


//Takes a string of arithematic operators and return the resulting integer value
function calculate(expression) {
  const AST = arthematicTreeMaker(expression);
  return getNodeValue(AST)
}
function getNodeValue(AST) {
  if(typeof AST === 'object') {
    const operator = AST.operator;
    if(operator === '+') {
      return getNodeValue(AST.left) + getNodeValue(AST.right);
    }
    if(operator === '*') {
      return getNodeValue(AST.left) * getNodeValue(AST.right);
    }
  }
  //It's a value if it isn't an object. EZ.
  return AST;
}

console.log("calculate('(3*1)+2')\n", calculate('(3*1)+2'));
console.log("calculate('3*(1+2)')\n", calculate('3*(1+2)'));

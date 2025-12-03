import React, { useState, useRef } from "react";

export default function StackExpressionLab() {
  const capacity = 10;
  const [stack, setStack] = useState([]);
  const [maxSize, setMaxSize] = useState(capacity);
  const [pushValue, setPushValue] = useState("");
  const [message, setMessage] = useState("");

  const push = (val) => {
    if (stack.length >= maxSize) {
      setMessage("Stack Overflow! Cannot push more elements.");
      return;
    }
    setStack([val, ...stack]);
    setMessage(`${val} pushed to stack.`);
    setPushValue("");
  };

  const pop = () => {
    if (stack.length === 0) {
      setMessage("Stack Underflow! Nothing to pop.");
      return;
    }
    const [top, ...rest] = stack;
    setStack(rest);
    setMessage(`${top} popped from stack.`);
  };

  const peek = () => {
    if (stack.length === 0) {
      setMessage("Stack is empty.");
      return null;
    }
    setMessage(`Top element: ${stack[0]}`);
    return stack[0];
  };

  const clearStack = () => {
    setStack([]);
    setMessage("Stack cleared.");
  };

  const precedence = (op) => {
    if (op === "^") return 4;
    if (op === "*" || op === "/") return 3;
    if (op === "+" || op === "-") return 2;
    return 0;
  };

  const isOperator = (c) => ["+", "-", "*", "/", "^"].includes(c);

  const tokenizeInfix = (s) => {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === " ") { i++; continue; }
      if (ch === "(" || ch === ")") { tokens.push(ch); i++; continue; }
      if (isOperator(ch)) { tokens.push(ch); i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let num = ch;
        i++;
        while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
        tokens.push(num);
        continue;
      }
      if (/[a-zA-Z]/.test(ch)) {
        let id = ch;
        i++;
        while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) id += s[i++];
        tokens.push(id);
        continue;
      }
      tokens.push(ch); i++;
    }
    return tokens;
  };

  const infixToPostfix = (infix) => {
    const tokens = tokenizeInfix(infix);
    const stack = [];
    const output = [];

    for (const token of tokens) {
      if (token === "(") stack.push(token);
      else if (token === ")") {
        while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop());
        if (stack.length && stack[stack.length - 1] === "(") stack.pop();
      } else if (isOperator(token)) {
        while (
          stack.length &&
          isOperator(stack[stack.length - 1]) &&
          ((precedence(stack[stack.length - 1]) > precedence(token)) ||
            (precedence(stack[stack.length - 1]) === precedence(token) && token !== "^"))
        ) output.push(stack.pop());
        stack.push(token);
      } else output.push(token);
    }
    while (stack.length) output.push(stack.pop());
    return output.join(" ");
  };

  const evaluatePostfix = (postfix) => {
    const tokens = postfix.trim().split(/\s+/).filter((t) => t.length > 0);
    const st = [];
    for (const token of tokens) {
      if (/^-?\d+(?:\.\d+)?$/.test(token)) st.push(Number(token));
      else if (token.length === 1 && isOperator(token)) {
        if (st.length < 2) return { error: "Invalid postfix expression" };
        const b = st.pop();
        const a = st.pop();
        let r = 0;
        switch (token) {
          case "+": r = a + b; break;
          case "-": r = a - b; break;
          case "*": r = a * b; break;
          case "/": if (b === 0) return { error: "Division by zero" }; r = a / b; break;
          case "^": r = Math.pow(a, b); break;
          default: return { error: `Unknown operator ${token}` };
        }
        st.push(r);
      } else return { error: `Unsupported token: ${token}` };
    }
    if (st.length !== 1) return { error: "Invalid postfix expression" };
    return { value: st[0] };
  };

  const [infixInput, setInfixInput] = useState("");
  const [postfixOutput, setPostfixOutput] = useState("");
  const [postfixInput, setPostfixInput] = useState("");
  const [postfixResult, setPostfixResult] = useState("");
  const capacityRef = useRef(null);

  const handleConvert = () => {
    try {
      const pf = infixToPostfix(infixInput);
      setPostfixOutput(pf);
      setMessage("Infix converted to Postfix.");
    } catch {
      setPostfixOutput("");
      setMessage("Error converting expression.");
    }
  };

  const handleEval = () => {
    const res = evaluatePostfix(postfixInput);
    if (res.error) {
      setPostfixResult(res.error);
      setMessage(res.error);
    } else {
      setPostfixResult(String(res.value));
      setMessage(`Result: ${res.value}`);
    }
  };

  const handleSetCapacity = () => {
    const newCap = parseInt(capacityRef.current.value || "0", 10);
    if (isNaN(newCap) || newCap <= 0) return;
    setMaxSize(newCap);
    setMessage(`Capacity set to ${newCap}. Stack cleared.`);
    setStack([]);
  };

  return (
    <div className="min-h-screen bg-blue-900 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-4 text-white">STACK & INFIX → POSTFIX EVALUATOR</h1>
      <div className="flex gap-6 w-full max-w-6xl">
        <div className="flex-[3] bg-gray-800 p-6 rounded-2xl shadow-lg flex gap-4">
          <div className="flex-1 bg-gray-700 p-4 rounded-lg">
            <h2 className="font-medium mb-2 text-white">Stack (capacity {maxSize})</h2>
            <label className="block text-sm mb-1 text-white">Set capacity</label>
            <div className="flex gap-2 mb-3">
              <input
                ref={capacityRef}
                className="p-2 rounded border border-gray-600 bg-gray-600 text-white"
                defaultValue={maxSize}
              />
              <button
                className="px-3 py-2 rounded bg-yellow-500 text-black font-semibold"
                onClick={handleSetCapacity}
              >
                Set
              </button>
            </div>
            <label className="block text-sm mb-1 text-white">Push value</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={pushValue}
                onChange={(e) => setPushValue(e.target.value)}
                className="p-2 rounded border w-full bg-gray-600 text-white"
              />
              <button
                className="px-3 py-2 rounded bg-green-600 text-white"
                onClick={() => push(pushValue)}
              >
                Push
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 rounded bg-amber-500 text-black" onClick={pop}>Pop</button>
              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => peek()}>Peek</button>
              <button className="px-3 py-2 rounded bg-red-500 text-white" onClick={clearStack}>Clear</button>
            </div>
            <div className="mb-2">
              <div className="text-sm font-medium text-white">Stack visualization</div>
              <div className={`mt-2 space-y-1 ${stack.length > 4 ? "max-h-48 overflow-y-auto" : ""}`}>
                {stack.length === 0 ? (
                  <div className="text-sm text-gray-400">[Empty Stack]</div>
                ) : (
                  stack.map((val, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded ${idx === 0 ? "bg-indigo-600 text-white" : "bg-gray-600 border border-gray-500"}`}
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-700 p-4 rounded-lg">
            <h2 className="font-medium mb-2 text-white">Infix → Postfix</h2>
            <textarea
              value={infixInput}
              onChange={(e) => setInfixInput(e.target.value)}
              className="w-full p-3 rounded border border-gray-600 bg-gray-600 text-white mb-2"
              rows={2}
              placeholder="e.g. (2+3)*4 or 12*(3+5)"
            />
            <div className="flex gap-2 mb-3">
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={handleConvert}>Convert</button>
              <button className="px-4 py-2 rounded bg-gray-600 text-white" onClick={() => { setInfixInput(''); setPostfixOutput(''); }}>Clear</button>
            </div>
            <label className="block text-sm mb-1 text-white">Postfix output</label>
            <input
              readOnly
              value={postfixOutput}
              className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white mb-2"
            />
            <h3 className="font-medium mb-2 text-white">Evaluate Postfix</h3>
            <input
              value={postfixInput}
              onChange={(e) => setPostfixInput(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white mb-2"
              placeholder="e.g. 2 3 + 4 *"
            />
            <div className="flex gap-2 mb-3">
              <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={handleEval}>Evaluate</button>
              <button className="px-4 py-2 rounded bg-gray-600 text-white" onClick={() => { setPostfixInput(''); setPostfixResult(''); }}>Clear</button>
            </div>
            <div>
              <label className="block text-sm text-white">Result</label>
              <div className="p-3 rounded border border-gray-600 bg-gray-600 min-h-[44px]">{postfixResult || "-"}</div>
            </div>
          </div>
        </div>

        <div className="flex-[1] bg-gray-900 p-4 rounded-lg border border-gray-600">
          <div className="text-yellow-400 font-semibold text-xl text-center mb-2 border-b border-yellow-400 pb-1">MESSAGE</div>
          <div className="text-sm mt-2 text-white">{message || "Ready."}</div>
        </div>
      </div>
    </div>
  );
}

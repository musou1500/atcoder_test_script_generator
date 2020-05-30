const copyToClipboard = (text) => {
  const el = document.createElement("textarea");
  el.textContent = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};


const getTestcases = () => {
  let idx = 0;
  const testcases = [];
  while (true) {
    const inEl = document.getElementById(`pre-sample${idx * 2}`);
    const outEl = document.getElementById(`pre-sample${idx * 2 + 1}`);
    if (!inEl || !outEl) {
      break;
    }

    testcases.push([inEl.textContent.trim(), outEl.textContent.trim()]);
    idx++;
  }

  return testcases;
};

const helperScript = `
const child_process = require("child_process");
const runTest = (executable, in_text, out_text) => {
  new Promise((resolve) => {
    const ch = child_process.spawn(executable);
    ch.stdin.write(in_text.trim() + "\\n");

    let res = "";
    ch.stdout.on("data", (data) => res += data);
    ch.stdout.on("end", () => {
      const passed = res.trim() == out_text.trim();
      if (!passed) {
        const message = \`expected:\\n\${out_text}--\\nactual:\${res}\\n\`;
        console.error(message);
      }

      resolve(passed);
    });
  });
};

`

const generateScript = (testcases) => testcases.map(([in_text, out_text], idx) => `
const in${idx} = \`
${in_text}
\`;
const out${idx} = \`
${out_text}
\`;
runTest("./a.out", in${idx}, out${idx});
`);

chrome.runtime.onMessage.addListener((request) => {
  console.log(request);
  if (request && request.type == "generate_testcase") {
    const testcases = getTestcases();
    const script = generateScript(testcases).join('\n');
    copyToClipboard(helperScript + script);
  }
});

console.log("content script loaded");

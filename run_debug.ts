const res = await fetch("http://localhost:8000/make-server-fc8eb847/test-debug-school");
const json = await res.json();
console.log(JSON.stringify(json, null, 2));

(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();function f(e,n){return n.get(String(e.value))}const d=new Map([["+",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]+e[1]},about:"(+ 5 2)		addition"}],["-",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]-e[1]},about:"(- 5 2)		subtraction"}],["*",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]*e[1]},about:"(* 5 2)		multiplication"}],["/",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]/e[1]},about:"(/ 5 2)		division"}],["%",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]%e[1]},about:"(% 5 2)		remainder after division"}],["<",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]<e[1]},about:"(< 5 2)		less than"}],[">",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]>e[1]},about:"(> 5 2)		greater than"}],["<=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]<=e[1]},about:"(<= 5 2)	less than or equal to"}],[">=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]>=e[1]},about:"(>= 5 2)	greater than or equal to"}],["==",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]==e[1]},about:"(== 5 2)	equal to"}],["!=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]!=e[1]},about:"(!= 5 2)	unequal to"}],["&",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]&&e[1]},about:"(& True False)	logical and"}],["|",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]||e[1]},about:"(| True False)	logical or"}],["!",{kind:"EV_FUNCTION",arity:1,value:function(e){return!e[0]},about:"(! True)	logical negation"}],["if",{kind:"EV_FUNCTION",arity:3,value:function(e){return e[0]?e[1]:e[2]},about:"(if True 4 8)	if-expression"}],["help",{kind:"EV_FUNCTION",arity:0,value:function(e){return v()},about:"(help)		prints this dialog"}],["Help",{kind:"EV_FUNCTION",arity:0,value:function(e){return v()},about:"(Help)		prints this dialog"}]]);function v(){let e=`
Symbol	Usage		Name
------------------------------------------------
`;for(const[n,t]of d.entries())t.kind==="EV_FUNCTION"&&t.arity!==void 0&&(e+=`${n}	${t==null?void 0:t.about}
`);return e+=`------------------------------------------------
`,e+=`You can write nested expressions, such as:

(+ 1 (* 2 4))
`,e+=`------------------------------------------------
`,e}function y(e){let n=0,t=!0;for(let r=0;r<e.length;r++)e[r]=="("?n++:e[r]==")"&&n--,n<0&&(t=!1);let i=n==0;return t&&i}function b(e){let n="";for(let t=0;t<e.length;t++)e[t]=="("?n+=" ( ":e[t]==")"?n+=" ) ":n+=e[t];return n}function a(e){return"kind"in e&&(e.kind==="Lexing Error"||e.kind==="Parsing Error"||e.kind==="Semantic Error"||e.kind==="Evaluation Error")}function h(e){return e.kind=="TokenBoolean"}function T(e){return e.kind=="TokenNumber"}function O(e){return e.kind=="TokenIdentifier"}function I(e){return e.kind=="TokenOpenParen"}function V(e){return e.kind=="TokenCloseParen"}function C(e){if(!y(e))return{kind:"Lexing Error",message:"invalid parentheses"};let t=b(e).split(" ");t=U(t);const i=t.map(F);for(const o of i)if(a(o))return o;return i}function U(e){let n=[];for(let t of e)t!=""&&n.push(t);return n}function F(e){let n=L(e)??$(e)??P(e)??D(e);return n===void 0?{kind:"Lexing Error",message:`invalid sequence of characters '${e}'`}:n}function L(e){if(e=="(")return{kind:"TokenOpenParen",value:"("};if(e==")")return{kind:"TokenCloseParen",value:")"}}function $(e){return e==="True"?{kind:"TokenBoolean",value:!0}:e==="False"?{kind:"TokenBoolean",value:!1}:void 0}function P(e){let n=Number(e);if(!isNaN(n))return{kind:"TokenNumber",value:n}}function D(e){if(/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(e))return{kind:"TokenIdentifier",value:e};if(/^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+$/.test(e))return{kind:"TokenIdentifier",value:e}}function _(e){return e.kind=="ND_BOOLEAN"}function m(e){return e.kind=="ND_NUMBER"}function E(e){return e.kind=="ND_IDENTIFIER"}function N(e){return e.kind=="ND_CALL"}function A(e){let n=k(e,0);if(a(n))return n;{let[t,i]=n;return i==e.length?[t,i]:i<e.length?{kind:"Parsing Error",message:"expected a single expression"}:{kind:"Parsing Error",message:"not all tokens could be evaluated"}}}function k(e,n=0){if(n<e.length){let t=e[n];if(h(t))return n++,[{kind:"ND_BOOLEAN",value:t.value},n];if(T(t))return n++,[{kind:"ND_NUMBER",value:t.value},n];if(O(t))return n++,[{kind:"ND_IDENTIFIER",value:t.value},n];if(I(t)){n++;let i=[],r=k(e,n);if(a(r))return r;{let[o,u]=r;for(n=u;n<e.length;){if(V(e[n]))return n++,[{kind:"ND_CALL",func:o,params:i},n];{let s=k(e,n);if(a(s))return s;{let[l,c]=s;n=c,i.push(l)}}}return{kind:"Parsing Error",message:"expected closing parentheses"}}}else return n++,{kind:"Parsing Error",message:`unable to parse token of kind ${e[n].kind}`}}else return{kind:"Parsing Error",message:"expected another token"}}function p(e,n){if(_(e))return{kind:"EV_VALUE",value:e.value};if(m(e))return{kind:"EV_VALUE",value:e.value};if(E(e))return f(e,n);if(N(e)){const t=e,i=t.func,r=p(i,n),o=t.params.map(s=>p(s,n)),u=o.find(a);if(u===void 0){const s=r.value,l=o.map(c=>c.value);return{kind:"EV_VALUE",value:s(l)}}else return u}return{kind:"Evaluation Error",message:"invalid expression"}}function g(e,n){if(_(e))return{kind:"OK"};if(m(e))return{kind:"OK"};if(E(e)){const t=e;return f(t,n)!==void 0?{kind:"OK"}:{kind:"Semantic Error",message:`unknown identifier '${t.value}'`}}else if(N(e)){const t=e,i=t.func,r=f(i,n);if(r!==void 0&&r.kind==="EV_FUNCTION")if(r.arity===t.params.length){const u=t.params.map(s=>g(s,n)).find(a);return u===void 0?{kind:"OK"}:u}else return{kind:"Semantic Error",message:`${t.params.length} argument(s) provided, expected ${r.arity}`};else{const o=t.func;let u=`expected a function identifier, got '${o.value}'`;return typeof o.value=="number"&&(u+=`.
Maybe you forgot a space between a '+' or '-' and a number`),{kind:"Semantic Error",message:u}}}return{kind:"Semantic Error",message:"invalid expression"}}function B(e){const n=C(e);if(a(n))return n.kind+": "+n.message+". ";{const i=A(n);if(a(i))return i.kind+": "+i.message+". ";{const[r,o]=i,u=g(r,d);if(a(u))return u.kind+": "+u.message+". ";{const s=p(r,d);return s.kind==="EV_VALUE"?s.value:s.kind==="EV_FUNCTION"?"Evaluation Error: result is a function. ":a(s)?`${s.kind}: ${s.message}. `:"Evaluation Error: unknown error. "}}}}function R(){const e=document.getElementById("input"),n=document.getElementById("output");n&&new MutationObserver(()=>{n.scrollTop=n.scrollHeight}).observe(n,{childList:!0});const t=e.value,i=B(t);n.textContent+=`> ${t}
${i}
`}document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("output");e&&(e.textContent=`



















Welcome! Try typing:

(+ 1 2)

and press Enter. For more info run:

(help)

`);const n=document.getElementById("input");n==null||n.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),R())})});

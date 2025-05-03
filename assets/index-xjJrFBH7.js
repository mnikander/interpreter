(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const u of i)if(u.type==="childList")for(const o of u.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const u={};return i.integrity&&(u.integrity=i.integrity),i.referrerPolicy&&(u.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?u.credentials="include":i.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function r(i){if(i.ep)return;i.ep=!0;const u=t(i);fetch(i.href,u)}})();function p(e){let n=0,t=!0;for(let i=0;i<e.length;i++)e[i]=="("?n++:e[i]==")"&&n--,n<0&&(t=!1);let r=n==0;return t&&r}function _(e){let n="";for(let t=0;t<e.length;t++)e[t]=="("?n+=" ( ":e[t]==")"?n+=" ) ":n+=e[t];return n}function a(e){return"kind"in e&&(e.kind==="Lexing Error"||e.kind==="Parsing Error"||e.kind==="Semantic Error"||e.kind==="Evaluation Error")}function E(e){return e.kind=="TokenBoolean"}function m(e){return e.kind=="TokenNumber"}function N(e){return e.kind=="TokenIdentifier"}function g(e){return e.kind=="TokenOpenParen"}function y(e){return e.kind=="TokenCloseParen"}function b(e){if(!p(e))return{kind:"Lexing Error",message:"invalid parentheses"};let t=_(e).split(" ");t=h(t);const r=t.map(T);for(const u of r)if(a(u))return u;return r}function h(e){let n=[];for(let t of e)t!=""&&n.push(t);return n}function T(e){let n=O(e)??I(e)??V(e)??C(e);return n===void 0?{kind:"Lexing Error",message:`invalid sequence of characters '${e}'`}:n}function O(e){if(e=="(")return{kind:"TokenOpenParen",value:"("};if(e==")")return{kind:"TokenCloseParen",value:")"}}function I(e){return e==="True"?{kind:"TokenBoolean",value:!0}:e==="False"?{kind:"TokenBoolean",value:!1}:void 0}function V(e){let n=Number(e);if(!isNaN(n))return{kind:"TokenNumber",value:n}}function C(e){if(/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(e))return{kind:"TokenIdentifier",value:e};if(/^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+$/.test(e))return{kind:"TokenIdentifier",value:e}}function U(e){return e.kind=="ND_BOOLEAN"}function F(e){return e.kind=="ND_NUMBER"}function L(e){return e.kind=="ND_IDENTIFIER"}function R(e){return e.kind=="ND_CALL"}function P(e){let n=f(e,0);if(a(n))return n;{let[t,r]=n;return r==e.length?[t,r]:r<e.length?{kind:"Parsing Error",message:"expected a single expression"}:{kind:"Parsing Error",message:"not all tokens could be evaluated"}}}function f(e,n=0){if(n<e.length){let t=e[n];if(E(t))return n++,[{kind:"ND_BOOLEAN",value:t.value},n];if(m(t))return n++,[{kind:"ND_NUMBER",value:t.value},n];if(N(t))return n++,[{kind:"ND_IDENTIFIER",value:t.value},n];if(g(t)){n++;let r=[],i=f(e,n);if(a(i))return i;{let[u,o]=i;for(n=o;n<e.length;){if(y(e[n]))return n++,[{kind:"ND_CALL",func:u,params:r},n];{let s=f(e,n);if(a(s))return s;{let[l,v]=s;n=v,r.push(l)}}}return{kind:"Parsing Error",message:"expected closing parentheses"}}}else return n++,{kind:"Parsing Error",message:`unable to parse token of kind ${e[n].kind}`}}else return{kind:"Parsing Error",message:"expected another token"}}const c=new Map([["+",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]+e[1]},about:"(+ 5 2)		addition"}],["-",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]-e[1]},about:"(- 5 2)		subtraction"}],["*",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]*e[1]},about:"(* 5 2)		multiplication"}],["/",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]/e[1]},about:"(/ 5 2)		division"}],["%",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]%e[1]},about:"(% 5 2)		remainder after division"}],["<",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]<e[1]},about:"(< 5 2)		less than"}],[">",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]>e[1]},about:"(> 5 2)		greater than"}],["<=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]<=e[1]},about:"(<= 5 2)	less than or equal to"}],[">=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]>=e[1]},about:"(>= 5 2)	greater than or equal to"}],["==",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]==e[1]},about:"(== 5 2)	equal to"}],["!=",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]!=e[1]},about:"(!= 5 2)	unequal to"}],["&",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]&&e[1]},about:"(& True False)	logical and"}],["|",{kind:"EV_FUNCTION",arity:2,value:function(e){return e[0]||e[1]},about:"(| True False)	logical or"}],["!",{kind:"EV_FUNCTION",arity:1,value:function(e){return!e[0]},about:"(! True)	logical negation"}],["if",{kind:"EV_FUNCTION",arity:3,value:function(e){return e[0]?e[1]:e[2]},about:"(if True 4 8)	if-expression"}],["help",{kind:"EV_FUNCTION",arity:0,value:function(e){return k(c)},about:"(help)		prints this dialog"}],["Help",{kind:"EV_FUNCTION",arity:0,value:function(e){return k(c)},about:"(Help)		prints this dialog"}]]);function k(e){let n=`
Symbol	Usage		Name
------------------------------------------------
`;for(const[t,r]of e.entries())r.kind==="EV_FUNCTION"&&r.arity!==void 0&&(n+=`${t}	${r==null?void 0:r.about}
`);return n+=`------------------------------------------------
`,n+=`You can write nested expressions, such as:

(+ 1 (* 2 4))
`,n+=`------------------------------------------------
`,n}function $(e,n){return n.get(String(e.value))}function d(e){if(U(e))return{kind:"EV_VALUE",value:e.value};if(F(e))return{kind:"EV_VALUE",value:e.value};if(L(e)){const n=e,t=$(n,c);return t!==void 0?t:{kind:"Evaluation Error",message:`unknown identifier '${n.value}'`}}else if(R(e)){const n=e,t=n.func,r=d(t);if(r.kind==="EV_FUNCTION")if(r.arity===n.params.length){const i=n.params.map(d),u=i.find(a);if(u===void 0){const o=r.value,s=i.map(l=>l.value);return{kind:"EV_VALUE",value:o(s)}}else return u}else return{kind:"Evaluation Error",message:`${n.params.length} argument(s) provided, expected ${r.arity}`};else{if(a(r))return r;{const i=n.func;let u=`expected a function identifier, got '${i.value}'`;return typeof i.value=="number"&&(u+=`.
Maybe you forgot a space between a '+' or '-' and a number`),{kind:"Evaluation Error",message:u}}}}return{kind:"Evaluation Error",message:"invalid expression"}}function D(e){const n=b(e);if(a(n))return"ERROR during lexing: "+n.message+". ";{const r=P(n);if(a(r))return"ERROR during parsing: "+r.message+". ";{const[i,u]=r,o=d(i);return o.kind==="EV_VALUE"?o.value:o.kind==="EV_FUNCTION"?"ERROR during evaluation: result is a function. ":a(o)?`ERROR during evaluation: ${o.message}. `:"ERROR during evaluation: unknown error. "}}}function A(){const e=document.getElementById("input"),n=document.getElementById("output");n&&new MutationObserver(()=>{n.scrollTop=n.scrollHeight}).observe(n,{childList:!0});const t=e.value,r=D(t);n.textContent+=`> ${t}
${r}
`}document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("output");e&&(e.textContent=`



















Welcome! Try typing:

(+ 1 2)

and press Enter. For more info run:

(help)

`);const n=document.getElementById("input");n==null||n.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),A())})});

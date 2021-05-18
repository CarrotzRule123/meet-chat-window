const field = document.getElementById("chat-field")

window.addEventListener("message", (e) => {
    field.innerHTML += e.data
}, false);

const input = document.getElementById("chat-input")
const btn = document.getElementById("chat-btn")

btn.onclick = () => {
    window.opener.postMessage(input.value, "*");
    input.value = ""
}

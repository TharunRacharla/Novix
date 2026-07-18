const send = document.getElementById("send");

send.onclick = async ()=>{

    let text = document.getElementById("message").value;

    const response = await fetch("/chat/",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            message:text
        })

    });

    const data = await response.json();

    document.getElementById("messages").innerHTML += `
        <div class="user">${text}</div>
        <div class="bot">${data.reply}</div>
    `;

}
//Style stuff
let $headline = $('.headline'),
    $inner = $('.inner'),
    $nav = $('nav'),
    navHeight = 75;

$(window).scroll(function() {
    var scrollTop = $(this).scrollTop(),
        headlineHeight = $headline.outerHeight() - navHeight,
        navOffset = $nav.offset().top;

    $headline.css({
        'opacity': (1 - scrollTop / headlineHeight)
    });
    $inner.children().css({
        'transform': 'translateY('+ scrollTop * 0.4 +'px)'
    });
    if (navOffset > headlineHeight) {
        $nav.addClass('scrolled');
    } else {
        $nav.removeClass('scrolled');
    }
});


//Server stuff
let loginData = {
    isIn: false,
    user: "",
    token: ""
}

const textDisplay = document.querySelector("#text-display")

function resetLoginData() {
    loginData = {
        isIn: false,
        user: "",
        token: ""
    }
    localStorage.removeItem("loginData");
    document.querySelector("#header-login").textContent = "";
    document.querySelector("#logout-button").style.display = "none";
}

resetLoginData();

if(localStorage.hasOwnProperty("loginData")) {
    loginData = JSON.parse(localStorage.getItem("loginData"));
}

function handleResponse(res) {
    res = JSON.parse(res);
    console.log(res);
    if (res.error) {
        textDisplay.textContent = "Error: "+res.error;
        return;
    }
    switch (res.source) {
        case "login":
            textDisplay.textContent = "Logging on...";
            loginData.token = res.token;
            post("check-token", "token");
            break;
        case "create-account":
            textDisplay.textContent = "Registered successfully, "+res.name
            break;
        case "check-token":
            loginData.isIn = true;
            loginData.user = res.name;
            loginData.token = res.id;
            textDisplay.textContent = "Logged in successfully, "+res.name;
            localStorage.setItem("loginData", JSON.stringify(loginData));
            document.querySelector("#header-login").textContent = "Logged in: "+res.name;
            document.querySelector("#logout-button").style.display = "inline";
            break;
        case "logout":
            textDisplay.textContent = "Logged out successfully, "+loginData.user;
            resetLoginData();
            break;
    }
}

function post(action, type) {
    if(action === "login" && loginData.isIn) {
        textDisplay.textContent = "You're already logged in!";
        return;
    }
    let sendData = {}
    if(type === "userpass") {
        sendData = {
            name: document.querySelector("#nameInput").value,
            user: document.querySelector("#userInput").value,
            pass: document.querySelector("#passInput").value
        }
    }
    if(type === "token") {
        sendData = {
            token: loginData.token
        }
    }
    const request = new Request('http://localhost:3001/bankAPI/'+action, {headers: {'Content-Type': 'application/json'},　method: 'POST', body: JSON.stringify(sendData)});
    fetch(request).then(response => response.text()).then(data => handleResponse(data));

}

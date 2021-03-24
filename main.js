//Style stuff
var $headline = $('.headline'),
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
    string: ""
}

const textDisplay = document.querySelector("#text-display")

function resetLoginData() {
    loginData = {
        isIn: false,
        user: "",
        string: ""
    }
    localStorage.removeItem("loginData");
    document.querySelector("#header-login").textContent = "";
    document.querySelector("#logout-button").style.display = "none";
}

if(localStorage.hasOwnProperty("loginData")) {
    loginData = JSON.parse(localStorage.getItem("loginData"));
}

if(loginData.isIn === true) {
    post("check-token", "userstring");
}

function handleResponse(res) {
    res = JSON.parse(res);
    switch(res.status) {
        case 111: // login: success
            textDisplay.textContent = "Successfully logged in, "+res.user+"!";
            loginData.isIn = true;
            loginData.user = res.user;
            loginData.string = res.string;
            document.querySelector("#header-login").textContent = "Logged in: "+loginData.user;
            document.querySelector("#logout-button").style.display = "inline";
            localStorage.setItem("loginData", JSON.stringify(loginData));
            break;
        case 211: // login: user doesn't exist
            textDisplay.textContent = "That user doesn't exist!";
            break;
        case 212: // login: incorrect password
            textDisplay.textContent = "Incorrect password!";
            break;
        case 121: // create-account: success
            textDisplay.textContent = "Successfully registered, "+res.user+"!";
            break;
        case 221: // create-account: user already exists
            textDisplay.textContent = "That username is already in use!";
            break;
        case 131: // check-token: success
            textDisplay.textContent = "Automatically logged in as "+res.user+"!";
            document.querySelector("#header-login").textContent = "Logged in: "+loginData.user;
            document.querySelector("#logout-button").style.display = "inline";
            break;
        case 231: // check-token: user doesn't exist
            textDisplay.textContent = "check-token: Account doesn't exist. Server restarted?"
            resetLoginData();
            break;
        case 232: // check-token: token expired
            textDisplay.textContent = "Your session has expired. Please log in again.";
            resetLoginData();
            break;
        case 233: // check-token: invalid token
            textDisplay.textContent = "check-token: Invalid token. Report this bug please.";
            resetLoginData();
            break;
        case 141: // logout: success
            textDisplay.textContent = "Logged out successfully.";
            resetLoginData();
            break;
        case 241: // logout: Account doesn't exist
            textDisplay.textContent = "logout: Account doesn't exist. Server restarted?";
            resetLoginData();
            break;
        case 242: // logout: Account exists but token is invalid
            textDisplay.textContent = "logout: Account exists but token is invalid. Report this bug please."
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
            user: document.querySelector("#userInput").value,
            pass: document.querySelector("#passInput").value
        }
    }
    if(type === "userstring") {
        sendData = {
            user: loginData.user,
            string: loginData.string
        }
    }
    const request = new Request('http://localhost:3001/bankAPI/'+action, {headers: {'Content-Type': 'application/json'},　method: 'POST', body: JSON.stringify(sendData)});
    fetch(request).then(response => response.text()).then(data => handleResponse(data));

}

const socket = io();
const $sendButton = document.querySelector("#send-button");
const $sendMessage = document.querySelector("#send-message");
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector('#sidebar');

const sidebarTemplate = document.querySelector("#sidebar-users").innerHTML;
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#message-location").innerHTML;

const autoscroll = () =>{
  // New Message Element
  const $newMessage = $messages.lastElementChild

  // Height of the new Message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  
  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of message container
  const containerHeight = $messages.scrollHeight;
  
  //How far I scrolled ?
  const scrollOffset = $messages.scrollTop + visibleHeight;
  // console.log(scrollOffset ," ", containerHeight ," ",newMessageHeight );
  if(containerHeight - newMessageHeight <= scrollOffset + visibleHeight){
    $messages.scrollTop = $messages.scrollHeight
  }
}

//options
var search = location.search.substring(1);
const obj = JSON.parse(
  '{"' 
  +
  decodeURI(search)
  .replace(/"/g, '\\"')
  .replace(/&/g, '","')
  .replace(/=/g, '":"')
  +
  '"}'
  );
  // console.log(obj);
const room = obj.room.replaceAll("+", " ");
const username = obj.username.replaceAll("+", " ");
// console.log(room,username);
socket.on("message", ({ message, createdAt, username }) => {
  //   console.log(message , createdAt);
  if (username === "Bot") {
    const html = Mustache.render(messageTemplate, {
      message,
      username,
      // createdAt : moment(createdAt).format('HH:mm')
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
  } else {
    const html = Mustache.render(messageTemplate, {
      message,
      username,
      createdAt: moment(createdAt).format("HH:mm"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
  }
});

socket.on('roomUsers' , ({room , roomUsers} , callback)=>{
  const html = Mustache.render(sidebarTemplate , {
    room,
    roomUsers
  });
  $sidebar.innerHTML = html;
})

socket.on("sendLocation", ({ message, createdAt,username}) => {
  console.log(username,message,createdAt);
  const html = Mustache.render(locationTemplate, {
    locationUrl: message,
    username,
    createdAt: moment(createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

$sendButton.addEventListener("click", (e) => {
  e.preventDefault();
  if ($sendMessage.value.length === 0) {
    return alert(`message can't be empty`);
  }
  $sendButton.setAttribute("disabled", "disabled");
  socket.emit("message", $sendMessage.value, (e) => {
    if (e) {
      alert(e);
    }
    $sendMessage.focus();
    $sendMessage.value = "";
    $sendButton.removeAttribute("disabled");
  });
  autoscroll();
});

$sendLocation.addEventListener("click", (e) => {
  e.preventDefault();
  if (navigator.geolocation) {
    $sendLocation.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit(
        "location",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        (error) => {
          $sendLocation.removeAttribute("disabled");
          if (error) {
            alert(error);
          }
        }
      );
    });
  } else {
    alert("your browser doesnt support navigator");
  }
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

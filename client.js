var name = "";
var receiveChannel;
var loginInput = document.querySelector('#loginInput'); 
var roomSelect = document.querySelector('#roomSelect');
var loginBtn = document.querySelector('#loginBtn');
var otherUsernameInput = document.querySelector('#otherUsernameInput'); 
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn');
var sendInvitationBtn = document.querySelector('#sendInvitationBtn');
var msgInput = document.querySelector('#msgInput'); 
var sendMsgBtn = document.querySelector('#sendMsgBtn'); 
var connectUser, myConnection, dataChannel;
var showMsg = document.querySelector('#showMsg');  
var AcceptBtn = document.querySelector('#AcceptBtn');
var RejectBtn = document.querySelector('#RejectBtn');
const audio2 = document.querySelector('audio#audio2');
const downloadAnchor = document.querySelector('a#download');
const fileInput = document.querySelector('input#fileInput');
let receiveBuffer = [];

var user = {};


const socket = io('http://gwebsocket.appspot.com/');
//var socket = io('http://localhost:8080');

//se ejecuta cuando se conecta un usuario  
socket.on('connect', function () {
    console.log(socket.id);
    socket.emit("usuario",socket.id);
}); 

//muestra el nombre del usuario que acepto 
socket.on('userAccepted',function(data){
    otherUsernameInput.value=data.username;
    console.log("userAccepted",data);
});

socket.on('offer',function(data){
    offer = data.offer;
    name = otherUsernameInput.value;
    console.log("offer",data);
    responseOffer(offer, name);
});

socket.on('answer',function(data){
    console.log("answer",data);
    myConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});

socket.on('candidate',function(data){
    console.log('candidate',data);
    myConnection.addIceCandidate(data.candidate).then(
        onAddIceCandidateSuccess,
        onAddIceCandidateError
    );
});

//recibe el nombre del usuario que acepto la invitacion
socket.on('calibration',function(data){
    otherUsernameInput.value=data.username;
    console.log('calibration',data);
});


//loguea al usuario
loginBtn.addEventListener("click", function() { 
    var data = {};
    data.username = loginInput.value;//nombre del usuario
    data.room = roomSelect.value;//nombre de la sala,supervisor o monitor
    user = data;
    socket.emit('login',data);//envia el evento de login 
    createWebRTC();

}); 

sendMsgBtn.addEventListener("click", function () { 
    const file = fileInput.files[0];
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

    // Handle 0 size files.
    downloadAnchor.textContent = '';
    const chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.addEventListener('load', e => {
        console.log('FileRead.onload ', e);
        dataChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
          readSlice(offset);
        }
    });
    const readSlice = o => {
        console.log('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
//    var val = msgInput.value; 
//    console.log("send message: ",msgInput.value);
//    console.log("State Channel " + dataChannel.readyState);
//    dataChannel.send(val); 
});

//acepta la invitacion
AcceptBtn.addEventListener("click", function() { 
   connectUser = otherUsernameInput.value;
   console.log('AcceptBtn',connectUser);
   socket.emit("accepted",{user,connectUser});
}); 
//rechaza la invitacion
RejectBtn.addEventListener("click", function() { 
   connectUser = otherUsernameInput.value;
   socket.emit("RejectBtn",connectUser);
}); 

connectToOtherUsernameBtn.addEventListener("click", function(){
    createOffer();
});

//envia los datos para abrir el canal webRTC
sendInvitationBtn.addEventListener("click", function () {
    socket.emit('invitation',user);
});
  
  


function createWebRTC(){
    //creating our RTCPeerConnection object 
    console.log("createWebRTC"); 
    var configuration = { 
        "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
    };
    myConnection = new RTCPeerConnection(configuration); 
    //setup ice handling 
    //when the browser finds an ice candidate we send it to another peer 
    myConnection.onicecandidate = function(event){ 
        console.log("onicecandidate", event);
        if (event.candidate){ 
            data = {};            
            data.candidate = event.candidate;
            data.connectUser = otherUsernameInput.value;;
            socket.emit("candidate",data);
         } 
    };
    openDataChannel();
//    openMediaDevices();
    
//    
}

function openMediaDevices(){
    myConnection.ontrack = gotRemoteStream;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    })
    .then(function(stream){
        localStream = stream;
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`Using Audio device: ${audioTracks[0].label}`);
        }
        localStream.getTracks().forEach(track => myConnection.addTrack(track, localStream));
        console.log('Adding Local Stream to peer connection');
    })
    .catch(e => {
      alert(`getUserMedia() error: ${e.name}`);
    });
}

  
function createOffer(){
    
    const offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 0,
      voiceActivityDetection: false
    };
    var otherUsername = otherUsernameInput.value;
    //make an offer 
    myConnection.createOffer(offerOptions).then(function (offer) { 
        data = {};
        data.offer = offer;
        data.connectUser = otherUsername;
        socket.emit('offer',data);//enviando oferta
         //setea su sdp (session description protocol)
         myConnection.setLocalDescription(offer); 
     }, function (error) { 
         alert("An error has occurred.",error); 
     }); 
}  


//paso2 recibo la offer
function responseOffer(offer, name) { 
    console.log("responseOffer",offer);
    myConnection.setRemoteDescription(offer);
    //crea la respuesta a la oferta 
    myConnection.createAnswer(function (answer) { 
        myConnection.setLocalDescription(answer); 
        data = {};
        data.answer = answer;
        data.connectUser = name;
        socket.emit('answer',data);//enviando oferta
    }, function (error) { 
        console.log("oops...error",error); 
    }); 
}

function gotRemoteStream(e) {
  if (audio2.srcObject !== e.streams[0]) {
    audio2.srcObject = e.streams[0];
    console.log('Received remote stream');
  }
}

function onAddIceCandidateSuccess(){
    console.log("AddIceCandidate success.");
}
function onAddIceCandidateError(event){
    console.log('Failed to add Ice Candidate: ', event);
}

function openDataChannel() { 
    myConnection.ondatachannel = receiveChannelCallback;
    console.log("Open Channel"); 
    var dataChannelOptions = { 
        reliable:true 
    }; 
	
    dataChannel = myConnection.createDataChannel("myDataChannel", dataChannelOptions);
}

function receiveChannelCallback(event) {
    console.log('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.binaryType = 'arraybuffer';
    receiveChannel.onmessage = onReceiveMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
    console.log(event);
    console.log(`Received Message ${event.data.byteLength}`);
    receiveBuffer.push(event.data);

    const received = new Blob(receiveBuffer);
    console.log(received);
    receiveBuffer = [];
    downloadAnchor.href = URL.createObjectURL(received);
    audio2.src = URL.createObjectURL(received);
    downloadAnchor.style.display = 'block';
    downloadAnchor.download = "Archivo Recibido";
    downloadAnchor.textContent =`Click to download "Archivo Recibido`;
    downloadAnchor.style.display = 'block';
//    console.log(event.data);
//    showMsg.value = event.data;
}

function onReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    console.log('Receive channel state is: ', readyState);
}
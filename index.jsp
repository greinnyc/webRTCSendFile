<%-- 
    Document   : cliente
    Created on : 09/07/2019, 08:46:40 AM
    Author     : gangulom
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang = "en"> 
   <head> 
      <meta charset = "utf-8" /> 
   </head>
	
   <body> 
        <div> 
            <input type = "text" id = "loginInput" /> 
            <select id = "roomSelect" >
                <option value="supervisor">supervisor</option>
                <option value="monitor">monitor</option>

            <select/> 
            <button id = "loginBtn">Login</button> 
      </div> 
		
      <div> 
         <input type = "text" id = "otherUsernameInput" /> 
         <button id="sendInvitationBtn">Send Invitation</button>
         <button id = "connectToOtherUsernameBtn">Establish connection</button>
         <button id = "AcceptBtn">Accept</button>
         <button id = "RejectBtn">Reject</button>
      </div> 
		
      <div> 
         <input type = "text" id = "msgInput" /> 
         <button id = "sendMsgBtn">Send text message</button> 
      </div> 
      <div> 
         <input type = "text" id = "showMsg" /> 
      </div>
       <div >
            <form id="fileInfo">
                <input type="file" id="fileInput" name="files"/>
            </form>
            <button disabled id="sendFile">Send</button>
            <!--<button disabled id="abortButton">Abort</button>-->
       </div>
       <div> 
         <audio id="audio2" src="" preload="auto" controls></audio>
      </div> 
       <a id="download" href=""></a>
<script src = "socket.js"></script>

      <script src = "client.js"></script>

      
   </body>
	
</html>
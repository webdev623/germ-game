var Packet = require('./packet');
var BinaryReader = require('./packet/BinaryReader');

endTime = 0;
limit = 0
first = true
firstRun = true;

function PacketHandler(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;
    this.protocol = 0;
    this.handshakeProtocol = null;
    this.handshakeKey = null;
    this.lastJoinTick = 0;
    this.lastChatTick = 0;
    this.lastStatTick = 0;
    this.lastQTick = 0;
    this.lastSpaceTick = 0;
    this.pressQ = false;
    this.pressW = false;
    this.pressSpace = false;
    this.mouseData = null;
    this.handler = {
        254: this.handshake_onProtocol.bind(this),
    };
	
	if(firstRun){
		countTime();
		firstRun = false;
		setInterval(countTime, 1000);
	}
//	
}


function countTime(){
	if(first){
		endTime = servergametime;
        limit = servergametime;
        first = false;
    }
    endTime--;
	
	if (endTime < 0)
        endTime = limit;
    
	
    //console.log(endTime);
}

module.exports = PacketHandler;

PacketHandler.prototype.handleMessage = function (message) {
    if (!this.handler.hasOwnProperty(message[0]))
        return;

    this.handler[message[0]](message);
    this.socket.lastAliveTime = this.gameServer.stepDateTime;
};

PacketHandler.prototype.handshake_onProtocol = function (message) {
    
//	setInterval(countTime, 1000);
	
	if (message.length !== 5) return;
    this.handshakeProtocol = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
    if (this.handshakeProtocol < 1 || this.handshakeProtocol > 18) {
        this.socket.close(1002, "Not supported protocol: " + this.handshakeProtocol);
        return;
    }
    this.handler = {
        255: this.handshake_onKey.bind(this),
    };
};

PacketHandler.prototype.handshake_onKey = function (message) {
	
    if (message.length !== 5) return;
    this.handshakeKey = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
    if (this.handshakeProtocol > 6 && this.handshakeKey !== 0) {
        this.socket.close(1002, "Not supported protocol");
        return;
    }
    this.handshake_onCompleted(this.handshakeProtocol, this.handshakeKey);
};

//  message hadler message map onmessage
PacketHandler.prototype.handshake_onCompleted = function (protocol, key) {

    //console.log("arrive message on space first");
    this.handler = {
        0: this.message_onJoin.bind(this),
        1: this.message_onSpectate.bind(this),
        2: this.message_onJoinParty.bind(this),
        3: this.message_onLeaveGame.bind(this),
        16: this.message_onMouse.bind(this),
        17: this.message_onKeySpace.bind(this),
        18: this.message_onKeyQ.bind(this),
        21: this.message_onKeyW.bind(this),
        22: this.message_onKeyE.bind(this),
        23: this.message_onKeyR.bind(this),
        24: this.message_onKeyT.bind(this),
        25: this.message_onKeyP.bind(this),
        26: this.message_onInvitePartyRequ.bind(this),//190731 by ju
        27: this.message_onAcceptPartyRequ.bind(this),//190731 by ju
        28: this.message_onPartyIndexChange.bind(this),//190731 by ju
        29: this.message_onLeavePartyRequest.bind(this),//190731 by ju
        30: this.message_onRequestMember.bind(this),////190731 by ju
        31: this.message_onMute.bind(this),//190731 by ju
        32: this.message_onChangeGameMode.bind(this),//190905
        99: this.message_onChat.bind(this),
		254: this.message_onStat.bind(this),
    };
    this.protocol = protocol;
    // Send handshake response
    this.sendPacket(new Packet.ClearAll());
    this.sendPacket(new Packet.SetBorder(this.socket.playerTracker, this.gameServer.border, this.gameServer.config.serverGamemode, "MultiOgar-Edited " + this.gameServer.version));
    // Send welcome message
    this.gameServer.sendChatMessage(null, this.socket.playerTracker, "WelCome to MultiOgar ");// + this.gameServer.version); //by cgc
    if (this.gameServer.config.serverWelcome1)
        this.gameServer.sendChatMessage(null, this.socket.playerTracker, this.gameServer.config.serverWelcome1);
    if (this.gameServer.config.serverWelcome2)
        this.gameServer.sendChatMessage(null, this.socket.playerTracker, this.gameServer.config.serverWelcome2);
    if (this.gameServer.config.serverChat == 0)
        this.gameServer.sendChatMessage(null, this.socket.playerTracker, "This server's chat is disabled.");
    if (this.protocol < 4)
        this.gameServer.sendChatMessage(null, this.socket.playerTracker, "WARNING: Protocol " + this.protocol + " assumed as 4!");
};


PacketHandler.prototype.message_onJoin = function (message) {
    var tick = this.gameServer.tickCounter;
    var dt = tick - this.lastJoinTick;
    this.lastJoinTick = tick;
    if (dt < 25 || this.socket.playerTracker.cells.length !== 0) {
        return;
    }
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    var text = null;
    if (this.protocol < 6)
        text = reader.readStringZeroUnicode();
    else
        text = reader.readStringZeroUtf8();
    this.setNickname(text);

    this.sendPacket(new Packet.PlayStart(this.socket.playerTracker, endTime));

};

PacketHandler.prototype.message_onSpectate = function (message) {
    if (message.length !== 1 || this.socket.playerTracker.cells.length !== 0) {
        return;
    }
    this.socket.playerTracker.spectate = true;
};

PacketHandler.prototype.message_onJoinParty = function(message){
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    var partyIndex = reader.readUInt32();
    console.log("JoinParty:" + partyIndex);
    var isValid = this.gameServer.isValidPartyIndex(partyIndex);
    if(isValid){
       this.socket.playerTracker._partyindex = partyIndex;
    }
}

PacketHandler.prototype.message_onLeaveGame = function(message){
    this.socket.playerTracker.leaveGame();
}

PacketHandler.prototype.message_onMouse = function (message) {
    if (message.length !== 13 && message.length !== 9 && message.length !== 21) {
        return;
    }
    this.mouseData = Buffer.concat([message]);
};

PacketHandler.prototype.message_onKeySpace = function (message) {
    ////console.log("arrive message on space");
    if (this.socket.playerTracker.miQ) {
        this.socket.playerTracker.minionSplit = true;
    } else {
        this.pressSpace = true;
    }
};

PacketHandler.prototype.message_onKeyQ = function (message) {
    if (message.length !== 1) return;
    var tick = this.gameServer.tickCoutner;
    var dt = tick - this.lastQTick;
    if (dt < this.gameServer.config.ejectCooldown) {
        return;
    }
    this.lastQTick = tick;
    if (this.socket.playerTracker.minionControl && !this.gameServer.config.disableQ) {
        this.socket.playerTracker.miQ = !this.socket.playerTracker.miQ;
    } else {
        this.pressQ = true;
    }
};

PacketHandler.prototype.message_onKeyW = function (message) {
    if (message.length !== 1) return;
    if (this.socket.playerTracker.miQ) {
        this.socket.playerTracker.minionEject = true;
    } else {
        this.pressW = true;
    }
};

PacketHandler.prototype.message_onKeyE = function (message) {
    if (this.gameServer.config.disableERTP) return;
    this.socket.playerTracker.minionSplit = true;
};

PacketHandler.prototype.message_onKeyR = function (message) {
    if (this.gameServer.config.disableERTP) return;
    this.socket.playerTracker.minionEject = true;
};

PacketHandler.prototype.message_onKeyT = function (message) {
    if (this.gameServer.config.disableERTP) return;
    this.socket.playerTracker.minionFrozen = !this.socket.playerTracker.minionFrozen;
};

PacketHandler.prototype.message_onKeyP = function (message) {
    if (this.gameServer.config.disableERTP) return;
    if (this.gameServer.config.collectPellets) {
        this.socket.playerTracker.collectPellets = !this.socket.playerTracker.collectPellets;
    }
};

PacketHandler.prototype.message_onChat = function (message) {
    //console.log("arrive message on chat");
    if (message.length < 3) return;
    var tick = this.gameServer.tickCounter;
    var dt = tick - this.lastChatTick;
    this.lastChatTick = tick;
    if (dt < 25 * 2) {
        return;
    }

    var flags = message[1];    // flags
    var rvLength = (flags & 2 ? 4:0) + (flags & 4 ? 8:0) + (flags & 8 ? 16:0);
    if (message.length < 3 + rvLength) // second validation
        return;

    var reader = new BinaryReader(message);
    reader.skipBytes(2 + rvLength);     // reserved
    var text = null;
    if (this.protocol < 6)
        text = reader.readStringZeroUnicode();
    else
        text = reader.readStringZeroUtf8();

    this.gameServer.onChatMessage(this.socket.playerTracker, null, text);
};

PacketHandler.prototype.message_onStat = function (message) {
	if (message.length !== 1) return;
    var tick = this.gameServer.tickCounter;
    var dt = tick - this.lastStatTick;
    this.lastStatTick = tick;
    if (dt < 25) {
        return;
    }
	
	//console.log(endTime);
	
    this.sendPacket(new Packet.ServerStat(this.socket.playerTracker, endTime));
};

//  190731 by ju
PacketHandler.prototype.message_onInvitePartyRequ = function(message) {
   ////console.log("arrive on invite message");
    
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    var name = reader.readStringUtf8();
    ////console.log("sendPartyRequesttttttttttt" + name);
    this.gameServer.sendPartyRequest(this.socket.playerTracker, name);
    //this.sendPacket(new Packet.AddPartyMem(this.socket.playerTracker));
};

//  190731 by ju
PacketHandler.prototype.message_onAcceptPartyRequ = function(message) {
    
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    var accept = reader.readUInt8();
    
    var clientname = this.socket.playerTracker._name;
    var partyname = reader.readStringUtf8();
    //console.log("PartyAccept arrive??????????????????" + partyname + "CLNAME :" + clientname);
    this.gameServer.sendAcceptParty(accept, clientname, partyname);
};

//  190731 by ju
PacketHandler.prototype.message_onPartyIndexChange  = function(message) {
    var reader = new BinaryReader(message);
    reader.skipBytes(1)
    var partyIndex = reader.readUInt32();
    
    this.socket.playerTracker._partyindex = partyIndex;
    if(partyIndex == 1){
        this.socket.playerTracker.changePartyIndex();
    }
    this.sendPacket(new Packet.CreateParty(this.socket.playerTracker));
    //this.gameServer.sendCreateParty(this.socket.playerTracker);
};

//  190731 by ju
PacketHandler.prototype.message_onLeavePartyRequest = function(message) {
    ////console.log("Party Leave Request arrive server");
    index = this.socket.playerTracker._partyindex;
	//console.log("aaa:" + index);
    this.socket.playerTracker.initPartyIndex();
    this.gameServer.LeaveParty(index, this.socket.playerTracker);
  //  this.sendPacket(new Packet.LeaveParty(this.socket.playerTracker));
};

//  190731 by ju
PacketHandler.prototype.message_onRequestMember = function(message){
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    var name = reader.readStringUtf8();
    this.gameServer.Getmember(name);
};


//  190731 by ju
PacketHandler.prototype.message_onMute = function(message){
    //console.log("arrive mute player");
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
 
    var setting = reader.readUInt8();
    var name = reader.readStringUtf8();
    var nameArrary = name.split(":");
    var muteName = nameArrary[1];
    name = nameArrary[0];
    //console.log("arrive mute player" + setting + " : name>>>" + name);
    this.gameServer.SetMute(setting, name, muteName);
}

PacketHandler.prototype.message_onChangeGameMode = function (message) {
    var reader = new BinaryReader(message);
    reader.skipBytes(1);
    this.socket.playerTracker.gameServer.gameMode.name = "Experimental";
    this.sendPacket(new Packet.ServerStat(this.socket.playerTracker, endTime));
}


PacketHandler.prototype.processMouse = function () {
    if (this.mouseData == null) return;
    var client = this.socket.playerTracker;
    var reader = new BinaryReader(this.mouseData);
    reader.skipBytes(1);
    if (this.mouseData.length === 13) {
        // protocol late 5, 6, 7
        client.mouse.x = reader.readInt32() - client.scrambleX;
        client.mouse.y = reader.readInt32() - client.scrambleY;
    } else if (this.mouseData.length === 9) {
        // early protocol 5
        client.mouse.x = reader.readInt16() - client.scrambleX;
        client.mouse.y = reader.readInt16() - client.scrambleY;
    } else if (this.mouseData.length === 21) {
        // protocol 4
        client.mouse.x = ~~reader.readDouble() - client.scrambleX;
        client.mouse.y = ~~reader.readDouble() - client.scrambleY;
    }
    this.mouseData = null;
};

PacketHandler.prototype.process = function () {
    if (this.pressSpace) { // Split cell
        this.socket.playerTracker.pressSpace();
        this.pressSpace = false;
    }
    if (this.pressW) { // Eject mass
        this.socket.playerTracker.pressW();
        this.pressW = false;
    }
    if (this.pressQ) { // Q Press
        this.socket.playerTracker.pressQ();
        this.pressQ = false;
    }
    if (this.socket.playerTracker.minionSplit) {
        this.socket.playerTracker.minionSplit = false;
    }
    if (this.socket.playerTracker.minionEject) {
        this.socket.playerTracker.minionEject = false;
    }
    this.processMouse();
};

PacketHandler.prototype.getRandomSkin = function () {
    var randomSkins = [];
    var fs = require("fs");
    if (fs.existsSync("../src/randomskins.txt")) {
        // Read and parse the Skins - filter out whitespace-only Skins
        randomSkins = fs.readFileSync("../src/randomskins.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty Skins
        });
    }
    // Picks a random skin
    if (randomSkins.length > 0) {
        var index = (randomSkins.length * Math.random()) >>> 0;
        var rSkin = randomSkins[index];
    }
    return rSkin;
};

PacketHandler.prototype.setNickname = function (text) {
    var name = "",
        skin = null;
    if (text != null && text.length > 0) {
        var skinName = null,
            userName = text,
            n = -1;
        if (text[0] == '<' && (n = text.indexOf('>', 1)) >= 1) {
            var inner = text.slice(1, n);
            if (n > 1)
                skinName = (inner == "r") ? this.getRandomSkin() : inner;
            else
                skinName = "";
            userName = text.slice(n + 1);
        }
        skin = skinName;
        name = userName;
    }

    if (name.length > this.gameServer.config.playerMaxNickLength)
        name = name.substring(0, this.gameServer.config.playerMaxNickLength);

    if (this.gameServer.checkBadWord(name)) {
        skin = null;
        name = "Hi there!";
    }

    this.socket.playerTracker.joinGame(name, skin);
};

PacketHandler.prototype.sendPacket = function(packet) {
    var socket = this.socket;
    if (!packet || socket.isConnected == null || socket.playerTracker.isMi)
        return;
    if (socket.readyState == this.gameServer.WebSocket.OPEN) {
        var buffer = packet.build(this.protocol);
        if (buffer) socket.send(buffer, { binary: true });
    } else {
        socket.readyState = this.gameServer.WebSocket.CLOSED;
        socket.emit('close');
    }
};

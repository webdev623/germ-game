function ServerStat(playerTracker, endTime) {
    this.playerTracker = playerTracker;
    this.endTime =endTime;
}

module.exports = ServerStat;

ServerStat.prototype.build = function (protocol) {
    var gameServer = this.playerTracker.gameServer;
    // Serialize
    var BinaryWriter = require("./BinaryWriter");
    var writer = new BinaryWriter();
    writer.writeUInt8(0); // Message Id
	writer.writeUInt8(gameServer.config.serverGamemode);
	writer.writeUInt16(this.endTime);
    return writer.toBuffer();
};

var BinaryWriter = require("./BinaryWriter");// 190731 by ju

function ChangeMute(sender) {
    this.sender = sender;
}

module.exports = ChangeMute;

ChangeMute.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x1F);                      // Packet ID
    name = this.sender._name;
    var isMuted = this.sender.isMuted ? 1 : 2;
    writer.writeUInt8(isMuted);
    if (protocol < 6) {
        writer.writeStringZeroUnicode(name);
    } else {
        writer.writeStringZeroUtf8(name);
    }
    
    return writer.toBuffer();
};
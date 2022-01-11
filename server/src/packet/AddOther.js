var BinaryWriter = require("./BinaryWriter");

function AddOther(playerTracker, x, y) {
    this.playerTracker = playerTracker;
    this.x = x;
    this.y = y;
}

module.exports = AddOther;

AddOther.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x21);                      // Packet ID
    writer.writeInt16(this.x);
    writer.writeInt16(this.y);
    var name = this.playerTracker._name;
    if (protocol < 6) {
        writer.writeStringZeroUnicode(name);
    } else {
        writer.writeStringZeroUtf8(name);
    }
    
    return writer.toBuffer();
};

var BinaryWriter = require("./BinaryWriter");// 190731 by ju

function Leaveparty(sender) {
    this.sender = sender;
}

module.exports = Leaveparty;

Leaveparty.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x1D);                      // Packet ID
    name = this.sender._name;
    partyIndex = this.sender._partyindex;
    writer.writeUInt8(partyIndex);
    if (protocol < 6) {
        writer.writeStringZeroUnicode(name);
    } else {
        writer.writeStringZeroUtf8(name);
    }
    return writer.toBuffer();
};
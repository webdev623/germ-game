var BinaryWriter = require("./BinaryWriter");// 190731 by ju

function CreateParty(sender) {
    this.sender = sender;
}

module.exports = CreateParty;

CreateParty.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x1C);                      // Packet ID
    name = this.sender._name;
    partyIndex = this.sender._partyindex;

    if (protocol < 6) {
        writer.writeStringZeroUnicode(name);
    } else {
        writer.writeStringZeroUtf8(name);
    }
    writer.writeUInt32(partyIndex);
    return writer.toBuffer();
};
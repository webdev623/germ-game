var BinaryWriter = require("./BinaryWriter");// 190731 by ju

function AddPartyMem(sender, clientname) {
    this.sender = sender;
    this.clientname = clientname;
}

module.exports = AddPartyMem;

AddPartyMem.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x1A);                      // Packet ID
    var name = this.sender._name;
    var client =  this.clientname;

    if (protocol < 6) {
        writer.writeStringZeroUnicode(name);
        writer.writeStringZeroUnicode(client);
    } else {
        writer.writeStringZeroUtf8(name);
        writer.writeStringZeroUtf8(client);
    }
    writer.writeUInt32(this.sender._partyindex);
    return writer.toBuffer();
};
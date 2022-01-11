var BinaryWriter = require("./BinaryWriter");

function AcceptParty(accept, clientname, partyIndex) {
    this.accept = accept;
    this.clientname = clientname;
    this.partyIndex = partyIndex;
}

module.exports = AcceptParty;

AcceptParty.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x1B); // Packet ID
    var string = "";
    var number = 0;
    if(this.accept === 3){
        string = ": already attended the party.";
    }
    if(this.accept === 1){
       string = ": accept your request";
       number = 1;
    }
    if(this.accept === 2){
        string = ": decline your request";
    }

    if (protocol < 6) {
        writer.writeStringZeroUnicode(this.partyIndex.toString());
        writer.writeStringZeroUnicode(this.clientname);
    }else{
        writer.writeStringZeroUtf8(this.partyIndex.toString());
        writer.writeStringZeroUtf8(this.clientname);
    }
    
    writer.writeUInt16(number);
    return writer.toBuffer();
};

var BinaryWriter = require("./BinaryWriter");

function SendPartyMember(partyMember, partyColor, spwanMass) {
    this.partyMember = partyMember;
    this.partyColor = partyColor;
	this.spwanMass = spwanMass;
}

module.exports = SendPartyMember;

SendPartyMember.prototype.parseName = function (value) { // static method
    value = value || "";
    var nameAndSkin = /^(?:\{([^}]*)\})?([^]*)/.exec(value);
    return {
        name: nameAndSkin[2].trim(),
        skin: (nameAndSkin[1] || "").trim() || nameAndSkin[2]
    };
};

SendPartyMember.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    var EMPTY_NAME = "An unnamed cell";
    writer.writeUInt8(0x1E);                      // Packet ID
    var count = this.partyMember.length;
    writer.writeUInt16(count);

    for (var i = 0; i < count; i++) {
        var name = this.parseName(this.partyMember[i]).name || EMPTY_NAME;
        var text = name; //by cgc
        var color = this.partyColor[i];
        var spm = this.spwanMass[i]; // by susan
       
        writer.writeUInt8(color.r >>> 0);         // Color R
        writer.writeUInt8(color.g >>> 0);         // Color G
        writer.writeUInt8(color.b >>> 0);         // Color B//ju0803

        if (protocol < 6) {
            writer.writeStringZeroUnicode(text);
        }
        else {
            writer.writeStringZeroUtf8(text);
        }

        writer.writeUInt16(spm);
    }
    return writer.toBuffer();
};

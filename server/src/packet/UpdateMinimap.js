var BinaryWriter = require("./BinaryWriter");

function UpdateMinimap(shownode) {
    this.shownode = shownode;
    //this.leaderboard = leaderboard;
    //this.leaderboardType = leaderboardType;
    //this.leaderboardCount = Math.min(leaderboard.length, playerTracker.gameServer.config.serverMaxLB);
}

module.exports = UpdateMinimap;

UpdateMinimap.prototype.build = function () {
    var writer = new BinaryWriter();
    len = this.shownode.length;
    writer.writeUInt8(0x34);//packetid
    writer.writeUInt16(len);//cell count


    
    for(var i = 0 ; i < len ; i++){

        var node = this.shownode[i];


        var scrambleX = this.shownode.scrambleX;
        var scrambleY = this.shownode.scrambleY;
        var scrambleId = this.shownode.scrambleId;

        var skinName = null;
        var cellName = null;
        if (node.owner) {
            skinName = node.owner._skinUtf8;
            cellName = node.owner._nameUtf8;
        }


        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;

        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeUInt32(cellX >> 0);                // Coordinate X
        writer.writeUInt32(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node._size >>> 0);


        var flags = 0;
            if (node.isSpiked)
                flags |= 0x01;      // isVirus
            if (node.cellType == 0)
                flags |= 0x02;      // isColorPresent (for players only)
            if (node.isAgitated)
                flags |= 0x10;      // isAgitated
            if (node.cellType == 3)
                flags |= 0x20;      // isEjected
            writer.writeUInt8(flags >>> 0);   


            if (flags & 0x02) {
                var color = node.color;
                writer.writeUInt8(color.r >>> 0);       // Color R
                writer.writeUInt8(color.g >>> 0);       // Color G
                writer.writeUInt8(color.b >>> 0);       // Color B
            }
            if (flags & 0x04)
                writer.writeBytes(skinName);       // Skin Name in UTF8
            if (flags & 0x08)
                writer.writeBytes(cellName);       // Cell Name in UTF8

        

    
    }

   //var protocol13s = 0;
   //for (var i in this.shownode.gameServer.clients) {
   //    var client = this.shownode.gameServer.clients[i].packetHandler;
   //    if (client.protocol >= 13) protocol13s++;
   //}
   //var writer = new BinaryWriter();
   //writer.writeUInt8(0x34); // Packet ID
   //writer.writeUInt16(protocol13s); // How many friends are in-game
   //for (var i = 0; i < this.leaderboardCount; i++) {
   //    var item = this.leaderboard[i];
   //    if (item == null) return null; // bad leaderboard just don't send it
   //    if (item === this.shownode) {
   //        writer.writeUInt8(0x09);
   //        writer.writeUInt16(1);
   //    } else {
   //        var name = item._name;
   //        writer.writeUInt8(0x02);
   //        if (name != null && name.length) writer.writeStringZeroUtf8(name);
   //        else writer.writeUInt8(0);
   //    }
   //}
   //var thing = this.leaderboard.indexOf(this.shownode) + 1;
   //var place = (thing <= 10) ? null : thing;
   //if (this.shownode.cells.length && place != null) {
   //    writer.writeUInt16(place);
   //}
   //console.log("build Party writer.buffer >>>>>>" + writer.toBuffer());
    return writer.toBuffer();
};

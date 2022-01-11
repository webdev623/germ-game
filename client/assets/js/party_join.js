$(document).ready(function(){
	
	var url, joinCode;
	var url_len, joinIndex, pos1, pos2;

	var url =  window.location.href;
	var url_len = url.length;

	joinIndex = url.indexOf("#");
	if (joinIndex !== -1){
		joinCode = url.slice(joinIndex + 1, url_len);
	}

	pos1 = url.indexOf("://") + 3;
	pos2 = url.lastIndexOf("/");

	var server_url = url.slice(pos1, pos2);
	
	if(joinCode){
		$("#partyFind").hide();
		$("#partySetting").addClass("box-glow-green");
		$("#partyCode").val(joinCode);
		$("#partyCode_URL").val(server_url + "/#" + joinCode);
		$("#partyMenu").show();
		$("#partyJoin").hide();
		window.join2Party();
	} else {
		$("#partyFind").show();
		$("#partyMenu").hide();
		$("#partyJoin").hide();
	}
	
	$("#btn_partyCreate").on('click', function(){
		$("#partyFind").hide();
		$("#partySetting").addClass("box-glow-green");
		$("#partyMenu").show();
		$("#partyJoin").hide();
		window.CreateParty();
	});

	$("#btn_partyJoin").on('click', function(){
		$("#partyFind").hide();
		$("#partyMenu").hide();
		$("#partySetting").removeClass("box-glow-green");
		$("#partyJoin").show();
	});

	$("#btn_joinCode").on('click', function(){
		var join_url = $("#partyJoinCode_URL").val();
		
		var pos1 = join_url.indexOf("#") + 1;
		var pos2 = join_url.length;
		var joinCode = join_url.slice(pos1, pos2);

		$("#partyJoinCode").val(joinCode);

		if(!window.isValidJoinCode()){
			alert("Invalid Party Code.");
			return;
		}
		$("#partyFind").hide();
		$("#partySetting").addClass("box-glow-green");
		$("#partyMenu").show();
		$("#partyJoin").hide();
		window.join2Party();
	});

});

function exitParty(){
	$("#partySetting").removeClass("box-glow-green");
	$("#partyFind").show();
	$("#partyMenu").hide();
	$("#partyJoin").hide();
	$("#partyCode").val('');
	$("#partyCode_URL").val('');
	window.cancelCreateParty();
}

function copyToClipboard(obj){
	obj.select();
	obj.setSelectionRange(0, 99999)
	document.execCommand("copy");
}

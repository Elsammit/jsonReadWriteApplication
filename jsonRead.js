let reader = new FileReader();

let huga = [];
function fileChanged(input){
    document.getElementById("InputList").style.opacity = 1.0;
    huga = "";
    for(let i = 0; i < input.files.length; i++){

        reader.readAsText(input.files[i], 'UTF-8');
        reader.onload = () =>{
            console.log(reader.result);
            
            if( /\.(json)$/i.test(input.files[i].name) ){
                console.log("jsonFile!!");
                huga = JSON.parse(reader.result);
            }else if( /\.(csv)$/i.test(input.files[i].name)){
                console.log("csvFile!!");
                huga = csv2json(reader.result);
            }else if(/\.(conf)$/i.test(input.files[i].name)){
                console.log("confFile!!");
                huga = confTojson(reader.result);
            }else{
                console.log("??? file!! " + input.files[i].name);
                alert("csvファイルかjsonファイルを選択ください");
                return;
            }

            var table = document.getElementById('table1'); 
            while (table.rows.length > 1){
                table.deleteRow(1);
            }
            for(let j = 0;j < huga.length;j++){
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);

                let checkBox = '<input type="radio" name="selectBtn" value="select'+j+'">'
                cell1.innerHTML = checkBox;
                cell2.innerHTML = "<input type='text' id='type" + j + "' onChange='ChangeText(" + (j*10+1) + ")' value='" + huga[j].type + "'>"
                cell3.innerHTML = "<input type='text' id='japan" + j + "' onChange='ChangeText(" + (j*10+2) + ")' value='" + huga[j].japan + "'>"
                cell4.innerHTML = "<input type='text' id='us" + j + "' onChange='ChangeText(" + (j*10+3) + ")' value='" + huga[j].us + "'>"
            }
        }
    }
}

// テーブル内文字列変更時の割り込み処理.
function ChangeText(input){
    let cell = input % 10;
    let Rows = Math.floor(input / 10);
    let idbuf;
    console.log("cell:"+cell +" Rows:"+Rows);
    switch(cell){
        case 1:
            idbuf = "type" + Rows;
            huga[Rows].type = document.getElementById(idbuf).value;
            break;
        case 2:
            idbuf = "japan" + Rows;
            huga[Rows].japan = document.getElementById(idbuf).value;
            break;
        case 3:
            idbuf = "us" + Rows;
            huga[Rows].us = document.getElementById(idbuf).value;
            break;
        default:
            break;
    }
    console.log(huga);
}

function ClickFunc(){
    let type = document.getElementById('type').value;
    let japan = document.getElementById('japan').value; 
    let us = document.getElementById('us').value; 
    let data = {type:type, japan:japan, us:us}
    huga.push(data);
    
    var table = document.getElementById('table1'); 
    var row = table.insertRow(-1); 
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);

    let checkBox = '<input type="radio" name="selectBtn" value="select'+huga.length+' onChange="SelectCheck()">'
    cell1.innerHTML = checkBox;
    cell2.innerHTML = "<input type='text' value='" + type + "'>"
    cell3.innerHTML = "<input type='text' value='" + japan + "'>"
    cell4.innerHTML = "<input type='text' value='" + us + "'>"
}

function WriteToFile(){
    let hugastring = JSON.stringify(huga);
    let blob = new Blob([hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.json';
    link.click();
}

// json to csv変換.
function json2csv(json) {
    var header = Object.keys(json[1]).join(',') + "\n";

    var body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(',');
    }).join("\n");

    return header + body;
}

// csv to json変換.
function csv2json(csvArray){
    var jsonArray = [];

    let RowArray = csvArray.split('\n');
    let items = RowArray[0].split(',');
    for(let i = 1; i < RowArray.length; i++){
        let cellArray = RowArray[i].split(',');
        var a_line = new Object();
        for(let j = 0; j < items.length; j++){
            a_line[items[j]] = cellArray[j];
        }
        jsonArray.push(a_line);
    }
    return jsonArray;
}

function confTojson(jsonArray){
    var jpNum = jsonArray.lastIndexOf( '[日本語]' );
    var usNum = jsonArray.lastIndexOf( '[英語]' );
    var result = jsonArray.substr( jpNum+6, usNum-6 );
    var result2 = jsonArray.substr( usNum+6,  jsonArray.length-usNum-6);
    console.log(result2);
    var mojiJp = "";
    var mojiUs = "";

    var lineJP = result.split('\n');
    var lineUS = result2.split('\n');
    let jsonData = [];

    for(let i=1;i<lineJP.length-2;i++){
        mojiJp = lineJP[i].split('=');
        mojiUs = lineUS[i-1].split('=');
        let buf = {type:mojiJp[0], japan:mojiJp[1], us:mojiUs[1]};
        jsonData.push(buf);
    }
    console.log(jsonData);
    return jsonData;
}

// csvファイルへのファイル書き込み.
function WriteToCSV(){
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let hugastring = json2csv(huga);
    console.log(hugastring);
    let blob = new Blob([bom, hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.csv';
    link.click();
}

function WriteConfigFile(){
    let writeString = "";
    writeString += "[日本語] \n";
    for(let i = 0; i < huga.length; i++){
        writeString += huga[i].type+"="+ huga[i].japan+"\n";
    }
    writeString += "\n";
    writeString += "[英語] \n";
    for(let i = 0; i < huga.length; i++){
        writeString += huga[i].type+"="+ huga[i].us+"\n";
    }    
    let blob = new Blob([bom, writeString],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.conf';
    link.click();
}


function DoFirstScript(){
    var dialog = document.querySelector('dialog');
    var btn_show = document.getElementById('showp');
    var btn_close = document.getElementById('closep');
    var btn_delete = document.getElementById('DeleteOK');

    btn_show.addEventListener('click', function() {
        let r = $('input[name="selectBtn"]:checked').val();
        console.log(r);
      dialog.show();
    }, false);
    btn_close.addEventListener('click', function() {
      dialog.close();
    }, false);
    btn_delete.addEventListener('click', function() {
        let r = $('input[name="selectBtn"]:checked').val();
        var table = document.getElementById('table1'); 
        let rStr = Number(r.substr(-1))+1;
        console.log("rows:"+table.rows.length+" r:"+r+" rStr:"+rStr);

        huga.splice(rStr-1,1);
        table.deleteRow(rStr);
        dialog.close();
      }, false);
}


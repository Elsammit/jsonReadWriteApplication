let reader = new FileReader();

let huga = [];      // 管理するデータリスト
let fileCount = 1;  // ファイル選択widget数.

// 第1ファイル選択画面にてファイルを選択した際の割り込み.
function fileChanged(input){
    document.getElementById("InputList").style.opacity = 1.0;
    huga = [];                  // 初期化.  
    DoFileToListAdd(input,0);   // リストへの追加処理.

    // 次の追加ファイル選択widget表示.
    let MessageTag = document.createElement("p");   
    let newContent = document.createTextNode("②連結したいファイルを選択ください");
    MessageTag.appendChild(newContent);
    let ParentInput = document.getElementById("inputFileList");
    ParentInput.appendChild(MessageTag);

    AddFileSelectChild();
}

function fileAdd(input){
    DoFileToListAdd(input,1);
    AddFileSelectChild();
}

// ファイル選択用Widget追加表示用.
function AddFileSelectChild(){
    let FileInputtag = document.createElement("input");
    FileInputtag.setAttribute('type','file');
    FileInputtag.setAttribute('id','file'+fileCount);
    fileCount++;
    FileInputtag.setAttribute('onChange','fileAdd(this)');
    let ParentInput = document.getElementById("inputFileList");
    ParentInput.appendChild(FileInputtag);
}

// ファイルからデータを読み出してデータをリストへ書き込み.
function DoFileToListAdd(input, flg){
    for(let i = 0; i < input.files.length; i++){
        reader.readAsText(input.files[i], 'UTF-8');
        reader.onload = () =>{
            
            if( /\.(json)$/i.test(input.files[i].name) ){
                console.log("jsonFile!!");
                if(flg == 0){
                    huga = JSON.parse(reader.result);
                }else{
                    let test = JSON.parse(reader.result);
                    for(let j=0;j<test.length;j++){
                        huga.push(test[j]);
                    }
                }
                
            }else if( /\.(csv)$/i.test(input.files[i].name)){
                console.log("csvFile!!");
                if(flg == 0){
                    huga = csv2json(reader.result);
                }else{
                    let test = csv2json(reader.result);
                    for(let j=0;j<test.length;j++){
                        huga.push(test[j]);
                    }
                }
                
            }else if(/\.(conf)$/i.test(input.files[i].name)){
                console.log("confFile!!");
                if(flg==0){
                    huga = confTojson(reader.result);
                }else{
                    let test = confTojson(reader.result);
                    for(let j=0;j<test.length;j++){
                        huga.push(test[j]);
                    }
                }
            }else if(/\.(xml)$/i.test(input.files[i].name)){
                console.log("XmlFile!!");
                if(flg==0){
                    huga = xmlTojson(reader.result);
                }else{
                    let test = xmlTojson(reader.result);
                    for(let j=0;j<test.length;j++){
                        huga.push(test[j]);
                    }
                }
            }else{
                console.log("??? file!! " + input.files[i].name);
                alert("csvファイルかjsonファイルを選択ください");
                return;
            }

            let table = document.getElementById('table1'); 
            table.deleteTHead();
            while (table.rows.length > 0){
                table.deleteRow(0);
            }

            AddTableTitle();

            for(let j = 0;j < huga.length;j++){
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                for(let k=0;k<Object.keys(huga[j]).length;k++){
                    let cell2 = row.insertCell(k+1);
                    cell2.innerHTML = "<input type='text' id='" + Object.keys(huga[j])[k] + j + "' onChange='ChangeText(" + (j*10+1) + ")' value='" + Object.values(huga[j])[k] + "'>"
                }
                let checkBox = '<input type="radio" name="selectBtn" value="select'+j+'">'
                cell1.innerHTML = checkBox;
            }
        }
    }
}

function AddTableTitle(){
    let table = document.getElementById('table1');
    let row = table.createTHead();
    let thObj = document.createElement("th");
    thObj.innerHTML = "削除選択";
    row.appendChild(thObj);
    
    for(let k=0;k<Object.keys(huga[0]).length;k++){
        let thObj2 = document.createElement("th");
        thObj2.innerHTML = "要素"+k+1;
        row.appendChild(thObj2);
    }
}

// テーブル内文字列変更時の割り込み処理.
function ChangeText(input){
    let cell = input % 10;
    let Rows = Math.floor(input / 10);
    let idbuf;
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
}

//　テーブルへのデータ追加
function ClickFunc(){
    let type = document.getElementById('type').value;
    let japan = document.getElementById('japan').value; 
    let us = document.getElementById('us').value; 
    let data = {type:type, japan:japan, us:us}
    huga.push(data);
    
    let table = document.getElementById('table1'); 
    let row = table.insertRow(-1); 
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    let checkBox = '<input type="radio" name="selectBtn" value="select'+huga.length+' onChange="SelectCheck()">'
    cell1.innerHTML = checkBox;
    cell2.innerHTML = "<input type='text' value='" + type + "'>"
    cell3.innerHTML = "<input type='text' value='" + japan + "'>"
    cell4.innerHTML = "<input type='text' value='" + us + "'>"
}


// jsonファイルとして出力
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
    let header = Object.keys(json[0]).join(',') + "\n";

    let body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(',');
    }).join("\n");

    return header + body;
}

// csv to json変換.
function csv2json(csvArray){
    let jsonArray = [];

    let RowArray = csvArray.split('\n');
    let items = RowArray[0].split(',');
    for(let i = 1; i < RowArray.length; i++){
        let cellArray = RowArray[i].split(',');
        let a_line = new Object();
        for(let j = 0; j < items.length; j++){
            a_line[items[j]] = cellArray[j];
        }
        jsonArray.push(a_line);
    }
    return jsonArray;
}

// conf to json.
function confTojson(jsonArray){
    let first = jsonArray.lastIndexOf( '[' );
    let second = jsonArray.lastIndexOf( ']' );

    let result = jsonArray.substr( 0, first );
    let result2 = jsonArray.substr( first,  second);
    let mojiJp = "";
    let mojiUs = "";

    let lineJP = result.split('\n');
    let lineUS = result2.split('\n');
    let jsonData = [];

    for(let i=1;i<lineJP.length-2;i++){
        mojiJp = lineJP[i].split('=');
        mojiUs = lineUS[i-1].split('=');
        let buf = {type:mojiJp[0], japan:mojiJp[1], us:mojiUs[1]};
        jsonData.push(buf);
    }
    return jsonData;
}

// xml to json
function xmlTojson(xmlArray){
    let parser = new DOMParser();
    let doc = parser.parseFromString(xmlArray, "application/xml");
    let nl = doc.getElementsByTagName("item");
    let matches = nl.length;

    let jsonData = [];
    for (let i = 0; i < matches; i++ ) {
        let e = nl.item(i);
        let youso = [];
        for(let j = 0;j < Math.floor(e.childNodes.length/2);j++){
            let type = e.getElementsByTagName(e.childNodes[1+j*2].nodeName);
            youso.push(type);
        }
        let buf = {type:youso[0].item(0).textContent, japan:youso[1].item(0).textContent, us:youso[2].item(0).textContent};
        jsonData.push(buf);
    }
    return jsonData;
}

// csvファイルへのファイル書き込み.
function WriteToCSV(){
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let hugastring = json2csv(huga);
    let blob = new Blob([bom, hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.csv';
    link.click();
}

// confファイルへの書き込み.
function WriteConfigFile(){
    let writeString = "";
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    writeString += "[japan] \n";
    for(let i = 0; i < huga.length; i++){
        writeString += huga[i].type+"="+ huga[i].japan+"\n";
    }
    writeString += "\n";
    writeString += "[us] \n";
    for(let i = 0; i < huga.length; i++){
        writeString += huga[i].type+"="+ huga[i].us+"\n";
    }    
    let blob = new Blob([bom, writeString],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.conf';
    link.click();
}

// jsonデータをxmlファイルとして出力する
function WriteXmlFile(){
    let writeString = "";
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    writeString += '<?xml version="1.0" encoding="UTF-8"?> \n';
    writeString += '<lists> \n';
    for(let i = 0; i < huga.length; i++){
        writeString += '    <item> \n';
        writeString += '        <type>' + huga[i].type + '</type> \n';
        writeString += '        <japan>' + huga[i].japan + '</japan> \n';
        writeString += '        <us>' + huga[i].us + '</us> \n';
        writeString += '    </item> \n';
    }
    writeString += '</lists> \n';
    let blob = new Blob([bom, writeString],{type:"application/xml"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.xml';
    link.click();
}

// データ削除のためのポップアップ作成用
function DoFirstScript(){
    let dialog = document.querySelector('dialog');
    let btn_show = document.getElementById('showp');
    let btn_close = document.getElementById('closep');
    let btn_delete = document.getElementById('DeleteOK');

    btn_show.addEventListener('click', function() {
        let r = $('input[name="selectBtn"]:checked').val();
      dialog.show();
    }, false);
    btn_close.addEventListener('click', function() {
      dialog.close();
    }, false);
    btn_delete.addEventListener('click', function() {
        let r = $('input[name="selectBtn"]:checked').val();
        let table = document.getElementById('table1'); 
        let rStr = Number(r.substr("select".length - r.length));

        huga.splice(rStr,1);
        table.deleteRow(rStr);
        dialog.close();
      }, false);
}

import {ReadJsonFile, ReadCsvFile, ReadConfFile, ReadXmlFile} from './FileProcessing.js';

let reader = new FileReader();

let huga = [];      // 管理するデータリスト
let fileCount = 1;  // ファイル選択widget数.

window.FileInfo = {
    InputFile:'',
    ChgFlg:0,
}

// 第1ファイル選択画面にてファイルを選択した際の割り込み.
window.fileChanged = (input) => {
    FileInfo.InputFile = input;
    FileInfo.ChgFlg = 0;

    if(huga.length > 0){
        huga = [];                  // 初期化. 
    }else{
        // 次の追加ファイル選択widget表示.
        const MessageTag = document.createElement("p");   
        const newContent = document.createTextNode("②連結したいファイルを選択ください");
        MessageTag.appendChild(newContent);
        const ParentInput = document.getElementById("inputFileList");
        ParentInput.appendChild(MessageTag);
    }
    DoFileToListAdd();   // リストへの追加処理.
    AddFileSelectChild();
}

window.fileAdd = (input) =>{
    FileInfo.InputFile = input;
    FileInfo.ChgFlg = 1;
    DoFileToListAdd();
    AddFileSelectChild();
}

// ファイル選択用Widget追加表示用.
function AddFileSelectChild(){
    const FileInputtag = document.createElement("input");
    FileInputtag.setAttribute('type','file');
    FileInputtag.setAttribute('id','file'+fileCount);
    fileCount++;
    FileInputtag.setAttribute('onChange','fileAdd(this)');
    const ParentInput = document.getElementById("inputFileList");
    ParentInput.appendChild(FileInputtag);
}

// ファイルからデータを読み出してデータをリストへ書き込み.
function DoFileToListAdd(){
    console.log("Promise3");
    new Promise((resolve, reject) =>{
        reader.readAsText(FileInfo.InputFile.files[0], 'UTF-8');
        console.log(FileInfo.InputFile.files[0]);
    
        reader.onload = () =>{
            ReadFileToMem();
            const table = document.getElementById('table1');
            table.style.visibility = "visible"; 
            table.deleteTHead();
            while (table.rows.length > 0){
                table.deleteRow(0);
            }
            resolve();
        }
    }).then( () =>{
        AddTableTitle();
        AddTableBody();
        AdditionalScreen();
    });                                                                                 
}

const ReadFileToMem = () =>{
    if( /\.(json)$/i.test(FileInfo.InputFile.files[0].name) ){
        console.log("jsonFile!!");
        huga = ReadJsonFile(reader, huga);
    }else if( /\.(csv)$/i.test(FileInfo.InputFile.files[0].name)){
        console.log("csvFile!!");
        huga = ReadCsvFile(reader, huga);
    }else if(/\.(conf)$/i.test(FileInfo.InputFile.files[0].name)){
        console.log("confFile!!");
        huga = ReadConfFile(reader, huga);
    }else if(/\.(xml)$/i.test(FileInfo.InputFile.files[0].name)){
        console.log("XmlFile!!");
        huga = ReadXmlFile(reader, huga);
    }else{
        console.log("??? file!! " + FileInfo.InputFile.files[0].name);
        alert("csvファイルかjsonファイルを選択ください");
        return;
    }
}

// テーブルタイトルの追加
function AddTableTitle(){
    console.log(huga);

    const table = document.getElementById('table1');
    table.style.visibility = "visible";
    const row = table.createTHead();
    const thObj = document.createElement("th");
    thObj.innerHTML = "削除選択";
    row.appendChild(thObj);
    
    for(const header of Object.keys(huga[0])){
        const thObj2 = document.createElement("th");
        thObj2.innerHTML = header;
        row.appendChild(thObj2);
    }
}

const AddTableBody = () =>{
    const table = document.getElementById('table1');
    for(let j = 0;j < huga.length;j++){
        const row = table.insertRow(-1);
        const cell1 = row.insertCell(0);
        for(let k=0;k<Object.keys(huga[j]).length;k++){
            const cell2 = row.insertCell(k+1);
            cell2.innerHTML = `<input type='text' id=${Object.keys(huga[j])[k] + j} onChange=ChangeText(${j*10+1}) value=${Object.values(huga[j])[k]}>`
        }
        cell1.innerHTML = `<input type="radio" name="selectBtn" value='select${j}'>`;
    }
}

const AdditionalScreen = () =>{
    const div = document.getElementById('InsertInfo');
    const ul = document.createElement('ul');
    new Promise((resolve, reject) => {
        const cell = MaxKeyValue();
        resolve(cell);
    }).then((cell)=>{
        for(let i = 0;i < cell.cnt;i++){
            const li = document.createElement('li');
            const label = document.createElement('label');
            const input = document.createElement('input');
            label.innerHTML = `${Object.keys(huga[cell.num])[i]} : `
            input.setAttribute('type', 'text');
            input.setAttribute('id', `${Object.keys(huga[cell.num])[i]}`);
            li.appendChild(label);
            li.appendChild(input);
            ul.appendChild(li);
        }
        div.appendChild(ul);
        (() =>{
            const InputList = document.getElementById('InputList');
            InputList.style.opacity = 1.0;
        })();
    });
}

const MaxKeyValue = () => {
    let cell = {num:0,cnt:0};
    for(let j = 0;j < huga.length;j++){
        const dataCellCnt = Object.keys(huga[j]).length;
        if(cell.cnt < dataCellCnt){
            cell.cnt = dataCellCnt;
            cell.num = j;
        }
    }
    return cell;
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

function CheckAlreadyResister(input){
    for(let j = 0;j < huga.length;j++){
        if(input["type"] == huga[j]["type"] || 
            input["japan"] ==  huga[j]["japan"] || 
            input["us"] == huga[j]["us"]){
                return j;
        }
    }
    return -1;
}

//　テーブルへのデータ追加
window.ClickFunc = () =>{
    // let cells = {};
    let chkFlg = false;
    new Promise((resolve, reject)=>{
        const cell = MaxKeyValue();
        resolve(cell);
    }).then((cell) =>{
        const cells = cell;
        const inputVal = [];
        
        let data = {};
        for(let i = 0;i < cell.cnt;i++){
            inputVal[i] = document.getElementById(Object.keys(huga[cell.num])[i]).value;
            if(inputVal[i] !== ''){
                chkFlg = true;
                data[Object.keys(huga[cell.num])[i]] = inputVal[i];

                document.getElementById(Object.keys(huga[cell.num])[i]).value = "";
            }
        }
        if(chkFlg === false){
            alert("未入力エラー");
        }else{
            // let ret = CheckAlreadyResister(data);
            const ret = -1;
            if(ret != -1){
                alert(ret+"番目ですでに登録済み");
            }else{
                huga.push(data);
                let table = document.getElementById('table1'); 
                table.style.visibility = "visible";
                let row = table.insertRow(-1); 
                let cell1 = row.insertCell(0);
            
                cell1.innerHTML = `<input type="radio" name="selectBtn" value=${huga.length} onChange="SelectCheck()">` 
                for(let i = 0;i < cells.cnt;i++){
                    const cellc = row.insertCell(i+1);
                    cellc.innerHTML = "<input type='text' value='" + inputVal[i] + "'>";
                }
            }
        }
    });
}


// jsonファイルとして出力
window.WriteToFile = () =>{
    const hugastring = JSON.stringify(huga);
    const blob = new Blob([hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.json';
    link.click();
}

// csvファイルへのファイル書き込み.
window.WriteToCSV = () =>{
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const hugastring = json2csv(huga);
    const blob = new Blob([bom, hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.csv';
    link.click();
}

// confファイルへの書き込み.
window.WriteConfigFile = () => {
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
window.WriteXmlFile = () =>{
    let writeString = "";
    let bom = new Uint8Arr
    ay([0xEF, 0xBB, 0xBF]);
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
 window.DoFirstScript = () =>{
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
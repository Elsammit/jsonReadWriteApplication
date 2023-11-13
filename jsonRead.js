import {GetMgmtDatas, SetMgmtDatas, 
        PushMgmtData, SetFileInfo,
        ReadFileFunc, MaxKeyValue, 
        CheckAlreadyResister, json2csv} from './FileProcessing.js';

let fileCount = 1;  // ファイル選択widget数.

// 第1ファイル選択画面にてファイルを選択した際の割り込み.
window.fileChanged = (input) => {
    SetFileInfo(input, 0);

    if(GetMgmtDatas().length > 0){           
        SetMgmtDatas([]);   // 初期化.
    }else{
        // 次の追加ファイル選択widget表示.
        const MessageTag = document.createElement("p");   
        const newContent = document.createTextNode("②連結したいファイルを選択ください");
        MessageTag.appendChild(newContent);
        const ParentInput = document.getElementById("inputFileList");
        ParentInput.appendChild(MessageTag);
    }
    DoFileToListAdd(0);   // リストへの追加処理.
    AddFileSelectChild();
}

window.fileAdd = (input) =>{
    SetFileInfo(input, 1);
    DoFileToListAdd(1);
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
function DoFileToListAdd(flg){
    const table = document.getElementById('table1');
    table.style.visibility = "visible"; 
    table.deleteTHead();
    while (table.rows.length > 0){
        table.deleteRow(0);
    }
    new Promise((resolve, reject) =>{
        ReadFileFunc(resolve);
    }).then( () =>{
        AddTableTitle();
        AddTableBody();
        if(flg === 0){
            AdditionalScreen();
        }
    });                                                                                 
}

// テーブルタイトルの追加
const AddTableTitle = () => {

    const table = document.getElementById('table1');
    table.style.visibility = "visible";
    const row = table.createTHead();
    const thObj = document.createElement("th");
    thObj.innerHTML = "削除選択";
    row.appendChild(thObj);
    
    for(const header of Object.keys(GetMgmtDatas()[0])){
        const thObj2 = document.createElement("th");
        thObj2.innerHTML = header;
        row.appendChild(thObj2);
    }
}

const AddTableBody = () =>{
    const table = document.getElementById('table1');
    for(let j = 0;j < GetMgmtDatas().length;j++){
        const row = table.insertRow(-1);
        row.setAttribute("id", `rowId${j}`);
        const cell1 = row.insertCell(0);
        for(let k=0;k<Object.keys(GetMgmtDatas()[j]).length;k++){
            const cell2 = row.insertCell(k+1);
            cell2.innerHTML = `<input type='text' id=${Object.keys(GetMgmtDatas()[j])[k] + j} 
                                onChange=ChangeText(${j}) value=${Object.values(GetMgmtDatas()[j])[k]}
                                width:90%>`
        }
        cell1.innerHTML = `<button onClick="DeleteData(rowId${j})">データ削除</button>`;
    }
}

const AdditionalScreen = () =>{
    const div = document.getElementById('AddBtnId');
    const ul = document.createElement('ul');
    new Promise((resolve, reject) => {
        const cell = MaxKeyValue();
        resolve(cell);
    }).then((cell)=>{
        for(let i = 0;i < cell.cnt;i++){
            const li = document.createElement('li');
            const label = document.createElement('label');
            const input = document.createElement('input');
            label.innerHTML = `${Object.keys(GetMgmtDatas()[cell.num])[i]} : `
            input.setAttribute('type', 'text');
            input.setAttribute('id', `${Object.keys(GetMgmtDatas()[cell.num])[i]}`);
            li.appendChild(label);
            li.appendChild(input);
            ul.appendChild(li);
        }
        div.before(ul);
        (() =>{
            const InputList = document.getElementById('InputList');
            InputList.style.opacity = 1.0;
        })();
    });
}

// テーブル内文字列変更時の割り込み処理.
window.ChangeText = (input) =>{
    for(let i=0;i<Object.keys(GetMgmtDatas()[input]).length;i++){
        GetMgmtDatas()[input][Object.keys(GetMgmtDatas()[input])[i]] = 
            document.getElementById(Object.keys(GetMgmtDatas()[input])[i] + input).value;
    }
}

//　テーブルへのデータ追加
window.ClickFunc = () =>{
    let chkFlg = false;
    new Promise((resolve, reject)=>{
        const cell = MaxKeyValue();
        resolve(cell);
    }).then((cell) =>{
        const cells = cell;
        const inputVal = [];
        
        let data = {};
        for(let i = 0;i < cell.cnt;i++){
            inputVal[i] = document.getElementById(Object.keys(GetMgmtDatas()[cell.num])[i]).value;
            if(inputVal[i] !== ''){
                chkFlg = true;
                data[Object.keys(GetMgmtDatas()[cell.num])[i]] = inputVal[i];

                document.getElementById(Object.keys(GetMgmtDatas()[cell.num])[i]).value = "";
            }
        }
        if(chkFlg === false){
            alert("未入力エラー");
        }else{
            const ret = CheckAlreadyResister(data);
            if(ret != -1){
                alert(ret+"番目ですでに登録済み");
            }else{
                PushMgmtData(data);
                const table = document.getElementById('table1'); 
                table.style.visibility = "visible";
                const row = table.insertRow(-1); 
                row.setAttribute("id", `rowId${GetMgmtDatas().length}`);
                const cell1 = row.insertCell(0);
            
                cell1.innerHTML = `<button onClick="DeleteData(rowId${GetMgmtDatas().length})">データ削除</button>`;
                for(let i = 0;i < cells.cnt;i++){
                    const cellc = row.insertCell(i+1);
                    cellc.innerHTML = "<input type='text' value='" + inputVal[i] + "'>";
                }
            }
        }
    });
}

window.DeleteData = (i) =>{
    const table = document.getElementById('table1');
    const rows = table.querySelectorAll('tr');
    let selectRow = null;
    console.log(i.id);
    for(let row of rows){
        console.log(row.rowIndex, row.id);
        if(i.id == row.id){
            selectRow = row;
        }
    }
    if(selectRow != null){
        if(confirm(`${selectRow.rowIndex} 行目を削除しますか？`)){
            const table = document.getElementById('table1'); 
            GetMgmtDatas().splice(selectRow.rowIndex,1);
            table.deleteRow(selectRow.rowIndex);
            alert(`削除しました`);
        }
    }
}

// jsonファイルとして出力
window.WriteToFile = () =>{
    const hugastring = JSON.stringify(GetMgmtDatas());
    const blob = new Blob([hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.json';
    link.click();
}

// csvファイルへのファイル書き込み.
window.WriteToCSV = () =>{
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const hugastring = json2csv(GetMgmtDatas());
    const blob = new Blob([bom, hugastring],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.csv';
    link.click();
}

// jsonデータをxmlファイルとして出力する
window.WriteXmlFile = () =>{
    let writeString = "";
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    writeString += '<?xml version="1.0" encoding="UTF-8"?> \n';
    writeString += '<lists> \n';
    for(let i = 0; i < GetMgmtDatas().length; i++){
        writeString += '    <item> \n';
        for(let k=0;k<Object.keys(GetMgmtDatas()[i]).length;k++){
            writeString += `        <${Object.keys(GetMgmtDatas()[i])[k]}>${GetMgmtDatas()[i][Object.keys(GetMgmtDatas()[i])[k]]}</${Object.keys(GetMgmtDatas()[i])[k]}> \n`
        }
        writeString += '    </item> \n';
    }
    writeString += '</lists> \n';
    let blob = new Blob([bom, writeString],{type:"application/xml"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '作ったファイル.xml';
    link.click();
}

menuIsHidden.addEventListener('change', (event) =>{
    let menuIsHidden = document.getElementById('menuIsHidden');
    let inputArea = document.getElementById('inputArea');
    console.log(inputArea);
    if(menuIsHidden.checked){
        inputArea.style.visibility = "visible";
    }else{
        inputArea.style.visibility = "hidden";
    }
});
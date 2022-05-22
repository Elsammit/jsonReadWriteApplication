'use strict'

let huga = [];      // 管理するデータリスト

const reader = new FileReader();
let FileInfo = {
    InputFile:'',
    ChgFlg:0,
}

export function SetFileInfo(fInfo, flg){
    FileInfo.InputFile = fInfo;
    FileInfo.ChgFlg = flg;
}

export function GetMgmtDatas(){
    return huga;
}

export function SetMgmtDatas(datas){
    huga = datas;
}

export function PushMgmtData(data){
    huga.push(data);
}

export function ReadFileFunc(resolve){
    reader.readAsText(FileInfo.InputFile.files[0], 'UTF-8');
    console.log(FileInfo.InputFile.files[0]);
    reader.onload = () =>{
        ReadFileToMem();
        resolve();
    }
}

export function ReadFileToMem(){
    if( /\.(json)$/i.test(FileInfo.InputFile.files[0].name) ){
        console.log("jsonFile!!");
        ReadJsonFile(reader);
    }else if( /\.(csv)$/i.test(FileInfo.InputFile.files[0].name)){
        console.log("csvFile!!");
        ReadCsvFile(reader);
    }else if(/\.(xml)$/i.test(FileInfo.InputFile.files[0].name)){
        console.log("XmlFile!!");
        ReadXmlFile(reader);
    }else{
        console.log("??? file!! " + FileInfo.InputFile.files[0].name);
        alert("csvファイルかjsonファイルを選択ください");
        return;
    }
}

function ReadJsonFile(reader){
    if(FileInfo.ChgFlg == 0){
        huga = JSON.parse(reader.result);
    }else{
        const jsonDatas = JSON.parse(reader.result);
        for(const jdata of jsonDatas){
            huga.push(jdata);
        }
    }
}

function ReadCsvFile(reader){
    if(FileInfo.ChgFlg == 0){
        huga = csv2json(reader.result);
    }else{
        const csvDatas = csv2json(reader.result);
        for(const cdata of csvDatas){
            huga.push(cdata);
        }
    }
}

// export function ReadConfFile(reader, huga){
//     if(FileInfo.ChgFlg == 0){
//         huga = confTojson(reader.result);
//     }else{
//         const confDatas = confTojson(reader.result);
//         for(const confdata of confDatas){
//             huga.push(confdata);
//         }
//     }
//     return huga;
// }

function ReadXmlFile(reader){
    if(FileInfo.ChgFlg == 0){
        huga = xmlTojson(reader.result);
    }else{
        const xmlDatas = xmlTojson(reader.result);
        for(const xdata of xmlDatas){
            huga.push(xdata);
        }
    }
}


// json to csv変換.
export function json2csv(json) {
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
// function confTojson(jsonArray){
//     let first = jsonArray.lastIndexOf( '[' );
//     let second = jsonArray.lastIndexOf( ']' );

//     let result = jsonArray.substr( 0, first );
//     let result2 = jsonArray.substr( first,  second);
//     let mojiJp = "";
//     let mojiUs = "";

//     let lineJP = result.split('\n');
//     let lineUS = result2.split('\n');
//     let jsonData = [];

//     for(let i=1;i<lineJP.length-2;i++){
//         mojiJp = lineJP[i].split('=');
//         mojiUs = lineUS[i-1].split('=');
//         let buf = {type:mojiJp[0], japan:mojiJp[1], us:mojiUs[1]};
//         jsonData.push(buf);
//     }
//     return jsonData;
// }

// xml to json
function xmlTojson(xmlArray){
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlArray, "application/xml");
    const nl = doc.getElementsByTagName("item");

    const jsonData = [];
    for(const e of nl){
        const buf = {};
        for(let j = 0;j < Math.floor(e.childNodes.length/2);j++){
            const type = e.getElementsByTagName(e.childNodes[1+j*2].nodeName);
            buf[type[0].tagName] = type[0].textContent;
        }
        jsonData.push(buf);
    }

    return jsonData;
}

export function MaxKeyValue(){
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

export function CheckAlreadyResister(input){
    const cell = MaxKeyValue();
    let cnt = 0;
    for(let j = 0;j < GetMgmtDatas().length;j++){
        for(let i = 0;i < cell.cnt;i++){
            if(GetMgmtDatas()[j][Object.keys(GetMgmtDatas()[cell.num])[i]] ==
                input[Object.keys(GetMgmtDatas()[cell.num])[i]]){
                    console.log("data is same");
                    cnt ++;
            }else{
                console.log("data is different");
            }
            if(cnt >= cell.cnt){
                return j;
            }
        }
    }
    return -1;
}
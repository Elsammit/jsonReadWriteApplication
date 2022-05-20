'use strict'

export function ReadJsonFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = JSON.parse(reader.result);
    }else{
        const jsonDatas = JSON.parse(reader.result);
        for(const jdata of jsonDatas){
            huga.push(jdata);
        }
    }
    return huga;
}

export function ReadCsvFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = csv2json(reader.result);
    }else{
        const csvDatas = csv2json(reader.result);
        for(const cdata of csvDatas){
            huga.push(cdata);
        }
    }
    return huga;
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

export function ReadXmlFile(reader, huga){
    if(FileInfo.ChgFlg == 0){
        huga = xmlTojson(reader.result);
    }else{
        const xmlDatas = xmlTojson(reader.result);
        for(const xdata of xmlDatas){
            huga.push(xdata);
        }
    }
    return huga;
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